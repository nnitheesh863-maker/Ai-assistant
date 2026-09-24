import { z } from 'zod';
import { groqService } from '../services/groqService.js';
import { MessageModel } from '../models/Message.js';
import { DeviceModel } from '../models/Device.js';
import { ActivityLogModel } from '../models/ActivityLog.js';
import { CommandValidator } from '../services/commandValidator.js';
import { websocketService } from '../services/websocketService.js';
import { COMMAND_STATUS } from '../../../shared/constants.js';

export const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  targetDeviceType: z.enum(['laptop', 'phone', 'tablet', 'all']).optional(),
  confirmed: z.boolean().optional()
});

export const chatController = {
  async sendMessage(req, res, next) {
    try {
      const { message: userText, targetDeviceType, confirmed = false } = req.body;
      const userId = req.user.id;

      // 1. Get user devices and chat history for context
      const userDevices = DeviceModel.findByUserId(userId);
      const history = MessageModel.findByUserId(userId, 8);

      // 2. Save user message to chat history
      MessageModel.create({
        userId,
        role: 'user',
        content: userText
      });

      // 3. Process natural language query with Groq AI (or fallback NLP)
      const aiResponse = await groqService.processMessage(userText, history, userDevices);
      let actionResult = null;
      let executionCommand = aiResponse.command;

      // Override device if user explicitly selected a target in UI
      if (executionCommand && targetDeviceType && targetDeviceType !== 'all') {
        executionCommand.device = targetDeviceType;
      }

      // 4. If structured command extracted, validate and dispatch
      if (executionCommand && executionCommand.intent) {
        const validation = CommandValidator.validate(executionCommand, userDevices);

        if (!validation.isValid) {
          actionResult = {
            status: COMMAND_STATUS.FAILED,
            error: validation.error,
            command: executionCommand
          };
        } else {
          const normCmd = validation.normalizedCommand;

          // Sensitive intent confirmation check
          if (normCmd.requires_confirmation && !confirmed) {
            const pendingLog = ActivityLogModel.create({
              userId,
              deviceId: null,
              deviceName: 'Pending Confirmation',
              deviceType: normCmd.device,
              rawCommand: userText,
              intent: normCmd.intent,
              target: normCmd.target,
              status: COMMAND_STATUS.AWAITING_CONFIRMATION,
              details: { ...normCmd.params, requires_confirmation: true }
            });

            actionResult = {
              status: COMMAND_STATUS.AWAITING_CONFIRMATION,
              commandId: pendingLog.id,
              normalizedCommand: normCmd,
              requires_confirmation: true,
              message: `Please confirm: ${normCmd.displayName}`
            };
          } else {
            // Find target physical device
            const matchedDevices = userDevices.filter((d) => d.type === normCmd.device);
            const targetDevice = matchedDevices.find((d) => websocketService.isDeviceOnline(d.deviceId)) || matchedDevices[0];

            if (!targetDevice) {
              actionResult = {
                status: COMMAND_STATUS.FAILED,
                error: `No registered ${normCmd.device} found. Please pair your ${normCmd.device}.`,
                command: normCmd
              };
            } else {
              // Create Activity Log
              const log = ActivityLogModel.create({
                userId,
                deviceId: targetDevice.deviceId,
                deviceName: targetDevice.name,
                deviceType: targetDevice.type,
                rawCommand: userText,
                intent: normCmd.intent,
                target: normCmd.target,
                status: COMMAND_STATUS.SENT_TO_DEVICE,
                details: normCmd.params
              });

              // Send command via WebSocket
              const dispatchResult = await websocketService.sendCommandToDevice(targetDevice.deviceId, {
                commandId: log.id,
                intent: normCmd.intent,
                target: normCmd.target,
                params: normCmd.params,
                timestamp: Date.now()
              });

              if (!dispatchResult.success) {
                ActivityLogModel.updateStatus(log.id, COMMAND_STATUS.FAILED, { error: dispatchResult.error });
                actionResult = {
                  status: COMMAND_STATUS.FAILED,
                  commandId: log.id,
                  device: targetDevice.name,
                  error: dispatchResult.error,
                  command: normCmd
                };
              } else {
                actionResult = {
                  status: COMMAND_STATUS.SENT_TO_DEVICE,
                  commandId: log.id,
                  device: targetDevice.name,
                  deviceType: targetDevice.type,
                  command: normCmd,
                  message: `Executing on ${targetDevice.name}...`
                };
              }
            }
          }
        }
      }

      // 5. Save assistant reply in chat history
      MessageModel.create({
        userId,
        role: 'assistant',
        content: aiResponse.reply,
        structuredCommand: executionCommand,
        executionResult: actionResult
      });

      res.json({
        success: true,
        data: {
          reply: aiResponse.reply,
          source: aiResponse.source,
          command: executionCommand,
          actionResult
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const messages = MessageModel.findByUserId(req.user.id, 50);
      res.json({
        success: true,
        data: messages
      });
    } catch (err) {
      next(err);
    }
  },

  async clearHistory(req, res, next) {
    try {
      MessageModel.clearHistory(req.user.id);
      res.json({
        success: true,
        message: 'Chat history cleared'
      });
    } catch (err) {
      next(err);
    }
  }
};
