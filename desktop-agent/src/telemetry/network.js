import os from 'os';

export class NetworkTelemetry {
  static getActiveInterfaces() {
    const interfaces = os.networkInterfaces();
    const active = [];
    for (const [name, addrs] of Object.entries(interfaces)) {
      for (const addr of addrs || []) {
        if (!addr.internal && addr.family === 'IPv4') {
          active.push({ name, ip: addr.address });
        }
      }
    }
    return active;
  }
}
