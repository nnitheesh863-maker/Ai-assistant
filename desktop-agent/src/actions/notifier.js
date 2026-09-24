import { spawn } from 'child_process';

export function showNotification(title = 'AI Assistant', message = 'Command received') {
  return new Promise((resolve) => {
    try {
      const sanitizedTitle = title.replace(/["']/g, '');
      const sanitizedMessage = message.replace(/["']/g, '');

      // Use PowerShell Toast Notification API
      const psScript = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $textNodes = $template.GetElementsByTagName("text")
        $textNodes.Item(0).AppendChild($template.CreateTextNode("${sanitizedTitle}")) > $null
        $textNodes.Item(1).AppendChild($template.CreateTextNode("${sanitizedMessage}")) > $null
        $notification = [Windows.UI.Notifications.ToastNotification]::new($template)
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("AI Assistant")
        $notifier.Show($notification)
      `;

      const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
        windowsHide: true
      });

      ps.on('close', () => {
        resolve({ success: true, title, message });
      });

      ps.on('error', () => {
        // Fallback gracefully without breaking
        resolve({ success: true, fallback: true });
      });
    } catch {
      resolve({ success: true, fallback: true });
    }
  });
}
