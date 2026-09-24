import { ActivityLogModel } from '../models/ActivityLog.js';
import { db } from '../config/database.js';

export const activityController = {
  async listActivity(req, res, next) {
    try {
      const logs = ActivityLogModel.findByUserId(req.user.id, 100);
      res.json({
        success: true,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  },

  async clearActivity(req, res, next) {
    try {
      const collection = db.getCollection('activityLogs');
      collection.delete((a) => a.userId === req.user.id);
      res.json({
        success: true,
        message: 'Activity log cleared'
      });
    } catch (err) {
      next(err);
    }
  }
};
