// Gamechanger #12 — date-fns v4: tree-shakeable, replaces moment/dayjs
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function chatTimestamp(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d))     return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM');
}

export function eventDate(date: Date | string): string {
  return format(new Date(date), 'EEE dd MMM · HH:mm');
}
