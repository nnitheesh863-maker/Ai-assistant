import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const messageCollection = db.getCollection('chatMessages');

export const MessageModel = {
  create({ userId, role, content, structuredCommand = null, executionResult = null }) {
    const msg = {
      id: uuidv4(),
      userId,
      role, // 'user', 'assistant', 'system'
      content,
      structuredCommand,
      executionResult,
      timestamp: new Date().toISOString()
    };
    return messageCollection.insert(msg);
  },

  findByUserId(userId, limit = 50) {
    return messageCollection
      .find((m) => m.userId === userId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  },

  clearHistory(userId) {
    return messageCollection.delete((m) => m.userId === userId);
  }
};
