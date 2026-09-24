import { z } from 'zod';
import { DeviceModel } from '../models/Device.js';
import { ActivityLogModel } from '../models/ActivityLog.js';
import { CommandValidator } from '../services/commandValidator.js';
import { websocketService } from '../services/websocketService.js';
import { COMMAND_STATUS } from '../../../shared/constants.js';

export const executeCommandSchema = z.object({
  deviceId: z.string().optional(),
  deviceType: z.enum(['laptop', 'phone', 'tablet', 'all']).optional(),
  intent: z.string(),
  target: z.any().optional(),
  params: z.record(z.any()).optional(),
  confirmed: z.boolean().optional()
});

export const commandController = {
  async execute(req, res, next) {
    try {
      const { deviceId, deviceType, intent, target, params = {}, confirmed = false } = req.body;
      const userDevices = DeviceModel.findByUserId(req.user.id);

      // Validate command
      const validation = CommandValidator.validate({ intent, device: deviceType, target, params }, userDevices);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      const normCmd = validation.normalizedCommand;

      // Sensitive intent check
      if (normCmd.requires_confirmation && !confirmed) {
        // Create pending log awaiting confirmation
        const log = ActivityLogModel.create({
          userId: req.user.id,
          deviceId: deviceId || null,
          deviceName: 'Pending Device',
          deviceType: normCmd.device,
          rawCommand: `${normCmd.intent} -> ${normCmd.target}`,
          intent: normCmd.intent,
          target: normCmd.target,
          status: COMMAND_STATUS.AWAITING_CONFIRMATION,
          details: { ...normCmd.params, requires_confirmation: true }
        });

        return res.status(200).json({
          success: true,
          status: COMMAND_STATUS.AWAITING_CONFIRMATION,
          requires_confirmation: true,
          commandId: log.id,
          normalizedCommand: normCmd,
          message: `Confirmation required for sensitive action: ${normCmd.displayName}`
        });
      }

      // Find matching device
      let targetDevice = null;
      if (deviceId) {
        targetDevice = userDevices.find((d) => d.deviceId === deviceId || d.id === deviceId);
      } else {
        // Auto-match device by type (prefer online devices)
        const matchedDevices = userDevices.filter((d) => d.type === normCmd.device);
        targetDevice = matchedDevices.find((d) => websocketService.isDeviceOnline(d.deviceId)) || matchedDevices[0];
      }

      if (!targetDevice) {
        return res.status(404).json({
          success: false,
          error: `No registered ${normCmd.device} found. Please pair or register your ${normCmd.device} first.`
        });
      }

      // Create activity log
      const log = ActivityLogModel.create({
        userId: req.user.id,
        deviceId: targetDevice.deviceId,
        deviceName: targetDevice.name,
        deviceType: targetDevice.type,
        rawCommand: `${normCmd.intent} -> ${normCmd.target}`,
        intent: normCmd.intent,
        target: normCmd.target,
        status: COMMAND_STATUS.SENT_TO_DEVICE,
        details: normCmd.params
      });

      // Dispatch via WebSocket to device agent
      const dispatchResult = await websocketService.sendCommandToDevice(targetDevice.deviceId, {
        commandId: log.id,
        intent: normCmd.intent,
        target: normCmd.target,
        params: normCmd.params,
        timestamp: Date.now()
      });

      if (!dispatchResult.success) {
        ActivityLogModel.updateStatus(log.id, COMMAND_STATUS.FAILED, { error: dispatchResult.error });
        return res.status(503).json({
          success: false,
          status: COMMAND_STATUS.FAILED,
          error: dispatchResult.error,
          device: targetDevice.name
        });
      }

      res.json({
        success: true,
        status: COMMAND_STATUS.SENT_TO_DEVICE,
        commandId: log.id,
        device: {
          id: targetDevice.id,
          name: targetDevice.name,
          type: targetDevice.type,
          deviceId: targetDevice.deviceId
        },
        normalizedCommand: normCmd,
        message: `Command sent to ${targetDevice.name}`
      });
    } catch (err) {
      next(err);
    }
  }
};
