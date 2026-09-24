import { spawn } from 'child_process';
import { isUrlAllowed } from '../security/allowlist.js';

export async function openWebsite(url) {
  if (!isUrlAllowed(url)) {
    throw new Error(`Security Violation: URL '${url}' violates safety allowlist.`);
  }

  return new Promise((resolve, reject) => {
    try {
      console.log(`[EXECUTOR] Opening website in default Windows browser: '${url}'`);

      const child = spawn('cmd.exe', ['/c', 'start', '', url], {
        detached: true,
        stdio: 'ignore'
      });

      child.on('error', (err) => {
        console.error(`[EXECUTOR] Browser launch error:`, err.message);
        reject(new Error(`Failed to launch browser: ${err.message}`));
      });

      child.unref();

      console.log(`[EXECUTOR] Browser opened for '${url}'`);

      resolve({
        success: true,
        action: 'OPEN_WEBSITE',
        url,
        message: `Website '${url}' opened in default browser.`
      });
    } catch (err) {
      console.error(`[EXECUTOR] Website open error:`, err.message);
      reject(new Error(`Could not open website: ${err.message}`));
    }
  });
}
