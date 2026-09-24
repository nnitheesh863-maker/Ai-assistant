import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { isFolderAllowed } from '../security/allowlist.js';

export async function openFolder(folderTarget) {
  if (!isFolderAllowed(folderTarget)) {
    throw new Error(`Security Violation: Access to folder '${folderTarget}' is unauthorized.`);
  }

  // Safely resolve the currently logged-in user's actual home directory
  const userHome = os.homedir();
  const subFolder = folderTarget.replace(/^USERPROFILE[\\/]/i, '').replace(/^[\\/]/, '');
  const absolutePath = path.join(userHome, subFolder);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Folder '${subFolder}' does not exist at '${absolutePath}'`);
  }

  return new Promise((resolve, reject) => {
    try {
      console.log(`[EXECUTOR] Opening folder in Windows Explorer: '${absolutePath}'`);

      const child = spawn('explorer.exe', [absolutePath], {
        detached: true,
        stdio: 'ignore'
      });

      child.on('error', (err) => {
        console.error(`[EXECUTOR] Explorer launch error:`, err.message);
        reject(new Error(`Failed to open folder: ${err.message}`));
      });

      child.unref();

      console.log(`[EXECUTOR] Explorer started successfully for '${subFolder}'`);

      resolve({
        success: true,
        action: 'OPEN_FOLDER',
        folder: subFolder,
        resolvedPath: absolutePath,
        message: `${subFolder.toUpperCase()} folder opened in Windows Explorer.`
      });
    } catch (err) {
      console.error(`[EXECUTOR] Folder open error:`, err.message);
      reject(new Error(`Could not open folder: ${err.message}`));
    }
  });
}
