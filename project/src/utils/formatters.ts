export function formatRelativeTime(isoString: string): string {
  const safeString = isoString.endsWith('Z') ? isoString : `${isoString}Z`;

  const now = new Date();
  const date = new Date(safeString);
  const diffMs = now.getTime() - (date.getTime() + 330 * 60 * 1000); // for Indian Time Format
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}
