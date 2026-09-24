import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const deviceCollection = db.getCollection('devices');

export const DeviceModel = {
  findById(id) {
    return deviceCollection.findOne((d) => d.id === id);
  },

  findByUserId(userId) {
    return deviceCollection.find((d) => d.userId === userId);
  },

  findByDeviceId(deviceId) {
    return deviceCollection.findOne((d) => d.deviceId === deviceId);
  },

  findByToken(deviceToken) {
    return deviceCollection.findOne((d) => d.deviceToken === deviceToken);
  },

  create({ userId, name, type, deviceId, deviceToken, os, platform, capabilities = [] }) {
    const newDevice = {
      id: uuidv4(),
      userId,
      name,
      type: type.toLowerCase(), // 'laptop', 'phone', 'tablet'
      deviceId: deviceId || uuidv4(),
      deviceToken,
      os: os || 'unknown',
      platform: platform || 'unknown',
      capabilities,
      isOnline: false,
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return deviceCollection.insert(newDevice);
  },

  updateStatus(deviceId, isOnline, additionalInfo = {}) {
    return deviceCollection.update(
      (d) => d.deviceId === deviceId || d.id === deviceId,
      {
        isOnline,
        lastSeen: new Date().toISOString(),
        ...additionalInfo
      }
    );
  },

  update(id, updates) {
    return deviceCollection.update((d) => d.id === id, updates);
  },

  delete(id, userId) {
    return deviceCollection.delete((d) => d.id === id && d.userId === userId);
  }
};
