import { z } from 'zod';
import { DeviceModel } from '../models/Device.js';
import { DeviceService } from '../services/deviceService.js';
import { websocketService } from '../services/websocketService.js';

export const pairSchema = z.object({
  code: z.string().length(6, 'Pairing code must be 6 digits'),
  name: z.string().optional(),
  type: z.enum(['laptop', 'phone', 'tablet']).optional(),
  deviceId: z.string().optional(),
  os: z.string().optional(),
  platform: z.string().optional()
});

export const createDeviceSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  type: z.enum(['laptop', 'phone', 'tablet']),
  os: z.string().optional(),
  platform: z.string().optional()
});

export const deviceController = {
  // Get all devices registered to the current user
  async listDevices(req, res, next) {
    try {
      const devices = DeviceModel.findByUserId(req.user.id);
      
      // Augment with real-time socket online status
      const augmented = devices.map((d) => ({
        ...d,
        isOnline: websocketService.isDeviceOnline(d.deviceId) || d.isOnline
      }));

      res.json({
        success: true,
        data: augmented
      });
    } catch (err) {
      next(err);
    }
  },

  // Generate pairing code for pairing a physical device
  async generatePairingCode(req, res, next) {
    try {
      const code = DeviceService.generatePairingCode(req.user.id);
      res.json({
        success: true,
        data: {
          code,
          expiresInMinutes: 10
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // Pair device endpoint called by desktop-agent or android APK with pairing code
  async pairDevice(req, res, next) {
    try {
      const { code, name, type, deviceId, os, platform } = req.body;
      const device = await DeviceService.pairDeviceWithCode({
        code,
        name,
        type,
        deviceId,
        os,
        platform
      });

      res.json({
        success: true,
        message: 'Device paired successfully',
        data: {
          id: device.id,
          deviceId: device.deviceId,
          deviceToken: device.deviceToken,
          name: device.name,
          type: device.type
        }
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  // Directly create/register a device (e.g., getting a device token for immediate configuration)
  async createDirect(req, res, next) {
    try {
      const { name, type, os, platform } = req.body;
      const device = DeviceService.registerDirect({
        userId: req.user.id,
        name,
        type,
        os,
        platform
      });

      res.status(201).json({
        success: true,
        message: 'Device registered successfully',
        data: device
      });
    } catch (err) {
      next(err);
    }
  },

  // Delete / unregister a device
  async deleteDevice(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = DeviceModel.delete(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Device not found' });
      }

      res.json({
        success: true,
        message: 'Device deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};
