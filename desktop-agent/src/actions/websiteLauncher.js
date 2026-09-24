import { exec } from 'child_process';
import { isUrlAllowed } from '../security/allowlist.js';

export async function openWebsite(url) {
  if (!isUrlAllowed(url)) {
    throw new Error(`Security violation: Invalid or unallowed URL '${url}'.`);
  }

  return new Promise((resolve, reject) => {
    const sanitizedUrl = url.replace(/'/g, "''");
    const psCmd = `powershell.exe -NoProfile -Command "(New-Object -ComObject Shell.Application).Open('${sanitizedUrl}')"`;

    exec(psCmd, (error) => {
      if (error) {
        exec(`explorer.exe "${url}"`, (expErr) => {
          if (expErr) {
            exec(`cmd.exe /c start "" "${url}"`, (cmdErr) => {
              if (cmdErr) {
                return reject(new Error(`Failed to open website: ${cmdErr.message}`));
              }
              resolve({
                success: true,
                action: 'OPEN_WEBSITE',
                url,
                message: `Opened ${url} in default browser`
              });
            });
          } else {
            resolve({
              success: true,
              action: 'OPEN_WEBSITE',
              url,
              message: `Opened ${url} in default browser`
            });
          }
        });
      } else {
        resolve({
          success: true,
          action: 'OPEN_WEBSITE',
          url,
          message: `Opened ${url} in default browser`
        });
      }
    });
  });
}
