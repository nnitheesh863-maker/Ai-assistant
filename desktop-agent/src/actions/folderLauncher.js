import { exec } from 'child_process';
import path from 'path';
import os from 'os';
import { isFolderAllowed } from '../security/allowlist.js';

export async function openFolder(folderTarget) {
  if (!isFolderAllowed(folderTarget)) {
    throw new Error(`Security violation: Access to folder '${folderTarget}' is unauthorized.`);
  }

  // Safely resolve user profile path
  const userProfile = os.homedir();
  const subPath = folderTarget.replace(/^USERPROFILE[\\/]/i, '');
  const absolutePath = path.join(userProfile, subPath);

  return new Promise((resolve, reject) => {
    const sanitizedPath = absolutePath.replace(/'/g, "''");
    const psCmd = `powershell.exe -NoProfile -Command "(New-Object -ComObject Shell.Application).Open('${sanitizedPath}')"`;

    exec(psCmd, (error) => {
      if (error) {
        exec(`explorer.exe "${absolutePath}"`, (expErr) => {
          if (expErr) {
            return reject(new Error(`Failed to open folder: ${expErr.message}`));
          }
          resolve({
            success: true,
            action: 'OPEN_FOLDER',
            folder: subPath,
            resolvedPath: absolutePath,
            message: `Opened ${subPath} folder`
          });
        });
      } else {
        resolve({
          success: true,
          action: 'OPEN_FOLDER',
          folder: subPath,
          resolvedPath: absolutePath,
          message: `Opened ${subPath} folder`
        });
      }
    });
  });
}
