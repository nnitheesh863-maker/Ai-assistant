import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export class ClipboardManager {
  static async copyText(text) {
    return { success: true, action: 'SET_CLIPBOARD', length: (text || '').length };
  }
}
