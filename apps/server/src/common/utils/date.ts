import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const DHAKA_TIMEZONE = 'Asia/Dhaka';

export function getDhakaDateString(date?: Date | string | number): string {
  return dayjs(date).tz(DHAKA_TIMEZONE).format('YYYY-MM-DD');
}

export function getDhakaNow(): dayjs.Dayjs {
  return dayjs().tz(DHAKA_TIMEZONE);
}

export function getSecondsUntilDhakaMidnight(date?: Date | string | number): number {
  const now = date ? dayjs(date).tz(DHAKA_TIMEZONE) : getDhakaNow();
  const endOfDay = now.endOf('day');
  const diffSeconds = endOfDay.diff(now, 'second');
  return Math.max(0, diffSeconds);
}

export { dayjs };
