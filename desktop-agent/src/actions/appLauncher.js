import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { isCommandAllowed } from '../security/allowlist.js';

// Common Windows Application executable paths lookup
function resolveAppExecutable(cleanTarget) {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const systemRoot = process.env.SystemRoot || 'C:\\Windows';

  const lookupPaths = {
    chrome: [
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe')
    ],
    'google chrome': [
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe')
    ],
    code: [
      path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      path.join(programFiles, 'Microsoft VS Code', 'Code.exe'),
      path.join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')
    ],
    vscode: [
      path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      path.join(programFiles, 'Microsoft VS Code', 'Code.exe'),
      path.join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')
    ],
    'vs code': [
      path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      path.join(programFiles, 'Microsoft VS Code', 'Code.exe'),
      path.join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')
    ],
    msedge: [
      path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    ],
    edge: [
      path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    ],
    spotify: [
      path.join(appData, 'Spotify', 'Spotify.exe'),
      path.join(localAppData, 'Microsoft', 'WindowsApps', 'Spotify.exe')
    ],
    calc: [
      path.join(systemRoot, 'System32', 'calc.exe')
    ],
    calculator: [
      path.join(systemRoot, 'System32', 'calc.exe')
    ],
    notepad: [
      path.join(systemRoot, 'System32', 'notepad.exe'),
      path.join(localAppData, 'Microsoft', 'WindowsApps', 'notepad.exe')
    ],
    explorer: [
      path.join(systemRoot, 'explorer.exe')
    ],
    'file explorer': [
      path.join(systemRoot, 'explorer.exe')
    ],
    wt: [
      path.join(localAppData, 'Microsoft', 'WindowsApps', 'wt.exe')
    ],
    terminal: [
      path.join(localAppData, 'Microsoft', 'WindowsApps', 'wt.exe')
    ]
  };

  const candidates = lookupPaths[cleanTarget] || [];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return cleanTarget;
}

export async function launchApplication(target) {
  if (!isCommandAllowed(target)) {
    throw new Error(`Security violation: Application command '${target}' is not in the desktop allowlist.`);
  }

  return new Promise((resolve, reject) => {
    const cleanTarget = target.trim().toLowerCase();
    const resolvedPath = resolveAppExecutable(cleanTarget);

    console.log(`🚀 Launching application: '${cleanTarget}' -> Resolved: '${resolvedPath}'`);

    // Use Explorer Shell & Shell.Application COM object to guarantee foreground visible window
    const sanitizedPath = resolvedPath.replace(/'/g, "''");
    const psCmd = `powershell.exe -NoProfile -Command "(New-Object -ComObject Shell.Application).Open('${sanitizedPath}')"`;

    exec(psCmd, (error) => {
      if (error) {
        // Fallback to explorer.exe directly
        exec(`explorer.exe "${resolvedPath}"`, (expErr) => {
          if (expErr) {
            // Final fallback to cmd start
            exec(`cmd.exe /c start "" "${resolvedPath}"`, (cmdErr) => {
              if (cmdErr) {
                return reject(new Error(`Failed to launch application '${cleanTarget}': ${cmdErr.message}`));
              }
              resolve({
                success: true,
                action: 'OPEN_APP',
                target: cleanTarget,
                resolvedPath,
                message: `Launched ${cleanTarget} on Windows laptop`
              });
            });
          } else {
            resolve({
              success: true,
              action: 'OPEN_APP',
              target: cleanTarget,
              resolvedPath,
              message: `Launched ${cleanTarget} on Windows laptop`
            });
          }
        });
      } else {
        resolve({
          success: true,
          action: 'OPEN_APP',
          target: cleanTarget,
          resolvedPath,
          message: `Launched ${cleanTarget} on Windows laptop`
        });
      }
    });
  });
}
