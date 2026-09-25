export class CommandSanitizer {
  static sanitizeQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== 'string') return '';
    return rawQuery.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }

  static normalizeAppName(appName) {
    if (!appName || typeof appName !== 'string') return '';
    return appName.trim().toLowerCase().replace(/[^a-z0-9._\-\s]/g, '');
  }

  static sanitizeUrl(url) {
    try {
      const parsed = new URL(url.trim());
      if (['http:', 'https:'].includes(parsed.protocol)) {
        return parsed.toString();
      }
      return null;
    } catch {
      return null;
    }
  }
}
