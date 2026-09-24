import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const activityCollection = db.getCollection('activityLogs');

export const ActivityLogModel = {
  create({ userId, deviceId, deviceName, deviceType, rawCommand, intent, target, status, details = {} }) {
    const log = {
      id: uuidv4(),
      userId,
      deviceId: deviceId || null,
      deviceName: deviceName || 'Unknown',
      deviceType: deviceType || 'general',
      rawCommand,
      intent,
      target: typeof target === 'object' ? JSON.stringify(target) : String(target || ''),
      status, // 'SUCCESS', 'FAILED', 'AWAITING_CONFIRMATION', 'UNAUTHORIZED', 'CANCELLED'
      details,
      timestamp: new Date().toISOString()
    };

    return activityCollection.insert(log);
  },

  findByUserId(userId, limit = 50) {
    return activityCollection
      .find((a) => a.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  updateStatus(id, status, details = {}) {
    return activityCollection.update((a) => a.id === id, {
      status,
      details,
      updatedAt: new Date().toISOString()
    });
  }
};
