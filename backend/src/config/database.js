import fs from 'fs';
import path from 'path';
import { config } from './env.js';

class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      users: [],
      devices: [],
      activityLogs: [],
      chatMessages: [],
      pairingRequests: []
    };
    this.init();
  }

  init() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        this.data.users = this.data.users || [];
        this.data.devices = this.data.devices || [];
        this.data.activityLogs = this.data.activityLogs || [];
        this.data.chatMessages = this.data.chatMessages || [];
        this.data.pairingRequests = this.data.pairingRequests || [];
      } catch (err) {
        console.error('Error reading database file, initializing fresh store:', err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing to database:', err);
    }
  }

  reload() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
        this.data.users = this.data.users || [];
        this.data.devices = this.data.devices || [];
        this.data.activityLogs = this.data.activityLogs || [];
        this.data.chatMessages = this.data.chatMessages || [];
        this.data.pairingRequests = this.data.pairingRequests || [];
      } catch (err) {
        console.error('Error reloading database file:', err);
      }
    }
  }

  getCollection(name) {
    this.reload();
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return {
      find: (predicate = () => true) => {
        this.reload();
        return (this.data[name] || []).filter(predicate);
      },
      findOne: (predicate) => {
        this.reload();
        return (this.data[name] || []).find(predicate) || null;
      },
      insert: (doc) => {
        this.reload();
        if (!this.data[name]) this.data[name] = [];
        this.data[name].push(doc);
        this.save();
        return doc;
      },
      update: (predicate, updates) => {
        const index = this.data[name].findIndex(predicate);
        if (index !== -1) {
          this.data[name][index] = { ...this.data[name][index], ...updates, updatedAt: new Date().toISOString() };
          this.save();
          return this.data[name][index];
        }
        return null;
      },
      delete: (predicate) => {
        const initialLen = this.data[name].length;
        this.data[name] = this.data[name].filter((item) => !predicate(item));
        this.save();
        return this.data[name].length < initialLen;
      }
    };
  }
}

export const db = new JsonDatabase(config.DB_PATH);
