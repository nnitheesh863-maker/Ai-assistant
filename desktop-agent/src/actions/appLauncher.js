import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { isCommandAllowed } from '../security/allowlist.js';

/**
 * Dynamically resolves Windows executable paths across standard installation locations
 */
export function resolveAppExecutable(cleanTarget) {
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
      return { found: true, path: candidate };
    }
  }

  // If specific path not found, fallback to target name for system commands (e.g. calc.exe, notepad.exe)
  return { found: false, path: cleanTarget };
}

/**
 * Launch an allowlisted Windows application using direct process spawning
 */
export async function launchApplication(target) {
  if (!isCommandAllowed(target)) {
    throw new Error(`Security Violation: Application '${target}' is not in the desktop allowlist.`);
  }

  const cleanTarget = target.trim().toLowerCase();
  const resolution = resolveAppExecutable(cleanTarget);

  return new Promise((resolve, reject) => {
    try {
      console.log(`[EXECUTOR] Launching application '${cleanTarget}' -> Path: '${resolution.path}'`);

      let child;
      if (resolution.found) {
        // Launch direct binary
        child = spawn(resolution.path, [], {
          detached: true,
          stdio: 'ignore'
        });
      } else {
        // Launch via shell start
        child = spawn('cmd.exe', ['/c', 'start', '', cleanTarget], {
          detached: true,
          stdio: 'ignore'
        });
      }

      child.on('error', (err) => {
        console.error(`[EXECUTOR] Process spawn error for ${cleanTarget}:`, err.message);
        reject(new Error(`Failed to start application: ${err.message}`));
      });

      child.unref();

      console.log(`[EXECUTOR] Process started successfully for ${cleanTarget} (PID: ${child.pid || 'detached'})`);

      resolve({
        success: true,
        action: 'OPEN_APP',
        target: cleanTarget,
        resolvedPath: resolution.path,
        pid: child.pid || null,
        message: `${cleanTarget.toUpperCase()} process started successfully on Windows laptop.`
      });
    } catch (err) {
      console.error(`[EXECUTOR] Execution error:`, err.message);
      reject(new Error(`Could not launch ${cleanTarget}: ${err.message}`));
    }
  });
}
