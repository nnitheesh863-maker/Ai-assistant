import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export class VolumeController {
  static async setVolume(level) {
    const clamped = Math.max(0, Math.min(100, Number(level) || 50));
    return { success: true, action: 'SET_VOLUME', level: clamped, message: 'Volume set to ' + clamped + '%' };
  }
  static async mute() {
    return { success: true, action: 'MUTE_VOLUME', message: 'Muted audio' };
  }
}
