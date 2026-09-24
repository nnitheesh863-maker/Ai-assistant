import { DeviceModel } from '../models/Device.js';
import { db } from '../config/database.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const pairingCollection = db.getCollection('pairingRequests');

export class DeviceService {
  /**
   * Generate a 6-digit temporary pairing code for pairing a new device to a user
   */
  static generatePairingCode(userId) {
    // Expire old codes for this user
    pairingCollection.delete((p) => p.userId === userId);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const pairingRequest = {
      id: uuidv4(),
      userId,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 mins
    };

    pairingCollection.insert(pairingRequest);
    return code;
  }

  /**
   * Claim and register a device using the pairing code
   */
  static async pairDeviceWithCode({ code, name, type, deviceId, os, platform }) {
    const now = new Date().toISOString();
    const req = pairingCollection.findOne((p) => p.code === code && p.expiresAt > now);

    if (!req) {
      throw new Error('Invalid or expired pairing code.');
    }

    const deviceToken = `dev_${crypto.randomBytes(24).toString('hex')}`;
    const cleanDeviceId = deviceId || `dev-id-${uuidv4().slice(0, 8)}`;

    // Check if device already exists for user
    const existing = DeviceModel.findByDeviceId(cleanDeviceId);
    if (existing) {
      const updated = DeviceModel.update(existing.id, {
        name: name || existing.name,
        type: type || existing.type,
        deviceToken,
        os: os || existing.os,
        platform: platform || existing.platform,
        isOnline: false
      });
      pairingCollection.delete((p) => p.id === req.id);
      return updated;
    }

    const newDevice = DeviceModel.create({
      userId: req.userId,
      name: name || `${type === 'phone' ? 'Android Mobile' : 'Windows Laptop'}`,
      type: type || 'laptop',
      deviceId: cleanDeviceId,
      deviceToken,
      os: os || 'Windows 11',
      platform: platform || 'desktop',
      capabilities: ['OPEN_APP', 'OPEN_WEBSITE', 'OPEN_FOLDER', 'GET_DEVICE_STATUS', 'SHOW_NOTIFICATION']
    });

    // Delete used pairing code
    pairingCollection.delete((p) => p.id === req.id);

    return newDevice;
  }

  /**
   * Directly register a device for authenticated user (e.g. from Web Dashboard)
   */
  static registerDirect({ userId, name, type, os, platform }) {
    const deviceToken = `dev_${crypto.randomBytes(24).toString('hex')}`;
    const deviceId = `dev-id-${uuidv4().slice(0, 8)}`;

    return DeviceModel.create({
      userId,
      name: name || (type === 'phone' ? 'My Android Phone' : 'My Windows Laptop'),
      type: type || 'laptop',
      deviceId,
      deviceToken,
      os: os || (type === 'phone' ? 'Android' : 'Windows 11'),
      platform: platform || (type === 'phone' ? 'mobile' : 'desktop'),
      capabilities: ['OPEN_APP', 'OPEN_WEBSITE', 'OPEN_FOLDER', 'GET_DEVICE_STATUS', 'SHOW_NOTIFICATION']
    });
  }
}
