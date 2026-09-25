export function exportChatAsMarkdown(messages = []) {
  const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'chat.md';
  a.click();
}
