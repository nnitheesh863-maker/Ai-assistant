import { db } from '../config/database.js';

export class DeviceHeartbeatManager {
  constructor(timeoutMs = 60000) {
    this.timeoutMs = timeoutMs;
    this.interval = null;
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => this.checkStaleDevices(), 30000);
    if (this.interval.unref) this.interval.unref();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  checkStaleDevices() {
    const devices = db.getCollection('devices').find() || [];
    const now = Date.now();

    devices.forEach((device) => {
      if (device.isOnline && device.lastHeartbeat) {
        const lastSeen = new Date(device.lastHeartbeat).getTime();
        if (now - lastSeen > this.timeoutMs) {
          db.getCollection('devices').update(device.id, { isOnline: false });
        }
      }
    });
  }
}

export const heartbeatManager = new DeviceHeartbeatManager();
