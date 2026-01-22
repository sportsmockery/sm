// lib/tiktokFormatters.ts
export function truncateCaption(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
