import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export class SystemPowerController {
  static async lockWorkstation() {
    await execAsync('rundll32.exe user32.dll,LockWorkStation');
    return { success: true, action: 'LOCK_WORKSTATION', message: 'Workstation locked' };
  }
}
