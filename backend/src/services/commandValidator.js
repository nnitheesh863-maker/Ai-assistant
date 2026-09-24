import {
  INTENTS,
  DEVICE_TYPES,
  LAPTOP_APP_ALLOWLIST,
  PHONE_APP_ALLOWLIST,
  LAPTOP_FOLDER_ALLOWLIST,
  SENSITIVE_INTENTS
} from '../../../shared/constants.js';

export class CommandValidator {
  /**
   * Validates and normalizes structured commands before sending to devices.
   */
  static validate(command, userDevices = []) {
    if (!command || typeof command !== 'object') {
      return {
        isValid: false,
        error: 'Invalid command payload format'
      };
    }

    const { intent, device: targetDeviceType, target, params = {} } = command;

    // Check if intent is known
    if (!intent || !Object.values(INTENTS).includes(intent)) {
      return {
        isValid: false,
        error: `Unsupported or unknown intent: '${intent}'`
      };
    }

    // Check target device type
    const normalizedDeviceType = (targetDeviceType || 'laptop').toLowerCase();
    if (!Object.values(DEVICE_TYPES).includes(normalizedDeviceType)) {
      return {
        isValid: false,
        error: `Unsupported target device type: '${targetDeviceType}'`
      };
    }

    // Determine if confirmation is mandatory
    const requiresConfirmation = SENSITIVE_INTENTS.includes(intent) || Boolean(command.requires_confirmation);

    // Intent-specific validation
    switch (intent) {
      case INTENTS.OPEN_APP: {
        if (!target || typeof target !== 'string') {
          return { isValid: false, error: 'Target app name is required' };
        }
        const cleanTarget = target.trim().toLowerCase();

        if (normalizedDeviceType === DEVICE_TYPES.LAPTOP) {
          const appConfig = LAPTOP_APP_ALLOWLIST[cleanTarget];
          if (!appConfig) {
            return {
              isValid: false,
              error: `Application '${target}' is not in the laptop allowlist.`
            };
          }
          return {
            isValid: true,
            normalizedCommand: {
              intent,
              device: normalizedDeviceType,
              target: appConfig.winCommand,
              displayName: appConfig.name,
              requires_confirmation: false,
              params
            }
          };
        } else if (normalizedDeviceType === DEVICE_TYPES.PHONE) {
          const appConfig = PHONE_APP_ALLOWLIST[cleanTarget];
          if (!appConfig) {
            return {
              isValid: false,
              error: `Application '${target}' is not in the mobile allowlist.`
            };
          }
          return {
            isValid: true,
            normalizedCommand: {
              intent,
              device: normalizedDeviceType,
              target: appConfig.package,
              displayName: appConfig.name,
              requires_confirmation: false,
              params
            }
          };
        }
        break;
      }

      case INTENTS.OPEN_WEBSITE: {
        if (!target || typeof target !== 'string') {
          return { isValid: false, error: 'URL is required for opening website' };
        }
        let url = target.trim();
        
        // Reject unsafe protocols
        const forbiddenSchemes = /^(file|javascript|data|vbscript|smb|ftp):/i;
        if (forbiddenSchemes.test(url)) {
          return { isValid: false, error: 'Only HTTP/HTTPS URLs are permitted.' };
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return { isValid: false, error: 'Only HTTP/HTTPS URLs are permitted.' };
          }
        } catch {
          return { isValid: false, error: 'Invalid website URL format.' };
        }

        return {
          isValid: true,
          normalizedCommand: {
            intent,
            device: normalizedDeviceType,
            target: url,
            displayName: `Website: ${url}`,
            requires_confirmation: false,
            params
          }
        };
      }

      case INTENTS.OPEN_FOLDER: {
        if (normalizedDeviceType !== DEVICE_TYPES.LAPTOP) {
          return { isValid: false, error: 'Opening folder is only supported on laptop.' };
        }
        const cleanFolder = (target || '').trim().toLowerCase();
        const folderPath = LAPTOP_FOLDER_ALLOWLIST[cleanFolder];
        if (!folderPath) {
          return {
            isValid: false,
            error: `Folder '${target}' is not in the authorized folders list (Allowed: Downloads, Documents, Desktop, Pictures, Music, Videos).`
          };
        }

        return {
          isValid: true,
          normalizedCommand: {
            intent,
            device: normalizedDeviceType,
            target: folderPath,
            displayName: `${cleanFolder.toUpperCase()} Folder`,
            requires_confirmation: false,
            params
          }
        };
      }

      case INTENTS.GET_DEVICE_STATUS: {
        return {
          isValid: true,
          normalizedCommand: {
            intent,
            device: normalizedDeviceType,
            target: 'status',
            displayName: 'Device Status Check',
            requires_confirmation: false,
            params
          }
        };
      }

      case INTENTS.SHOW_NOTIFICATION: {
        return {
          isValid: true,
          normalizedCommand: {
            intent,
            device: normalizedDeviceType,
            target: typeof target === 'string' ? target : 'Notification',
            displayName: 'Show Notification',
            requires_confirmation: false,
            params: {
              title: params.title || 'Assistant Alert',
              message: params.message || target || ''
            }
          }
        };
      }

      case INTENTS.SEND_MESSAGE: {
        return {
          isValid: true,
          normalizedCommand: {
            intent,
            device: normalizedDeviceType,
            target: target || 'whatsapp',
            displayName: `Send message to ${params.recipient || 'recipient'}`,
            requires_confirmation: true,
            params
          }
        };
      }

      case INTENTS.LOCK_DEVICE:
      case INTENTS.SLEEP_DEVICE: {
        return {
          isValid: true,
          normalizedCommand: {
            intent,
            device: normalizedDeviceType,
            target: intent.toLowerCase(),
            displayName: intent === INTENTS.LOCK_DEVICE ? 'Lock Device' : 'Put Device to Sleep',
            requires_confirmation: true,
            params
          }
        };
      }

      default:
        return {
          isValid: true,
          normalizedCommand: {
            intent,
            device: normalizedDeviceType,
            target,
            requires_confirmation: requiresConfirmation,
            params
          }
        };
    }

    return { isValid: false, error: 'Command validation failed' };
  }
}
