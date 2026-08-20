export function localDateFromISODate(isoDate: string): Date {
  // isoDate is in the format YYYY-MM-DD and should be treated as a calendar date
  // Create a Date using local time to avoid UTC timezone shifting to previous/next day
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1; // 0-based month
  const day = Number(dayStr);
  return new Date(year, monthIndex, day);
}

export function localDateTimeFromISOMinute(isoMinute: string): Date {
  // isoMinute format: YYYY-MM-DDTHH:mm (Open-Meteo with timezone applied, but no offset)
  const [datePart, timePart] = isoMinute.split('T');
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  const [hourStr, minuteStr] = timePart.split(':');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/** Format an instant as YYYY-MM-DDTHH:mm in an IANA timezone. */
export function isoMinuteInTimeZone(date: Date, timeZone: string): string {
  const p = getTimeZoneParts(date, timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function isoDateInTimeZone(date: Date, timeZone: string): string {
  return isoMinuteInTimeZone(date, timeZone).slice(0, 10);
}

export function unixSecondsToDate(unixSeconds: number): Date {
  return new Date(unixSeconds * 1000);
}

export function nowISOMinuteInTimeZone(timeZone: string): string {
  return isoMinuteInTimeZone(new Date(), timeZone);
}

export function nowISODateInTimeZone(timeZone: string): string {
  return isoDateInTimeZone(new Date(), timeZone);
}

/** Truncate YYYY-MM-DDTHH:mm to the hour for matching forecast rows. */
export function isoMinuteToHour(isoMinute: string): string {
  return `${isoMinute.slice(0, 13)}:00`;
}

export function formatTimeInTimeZone(
  unixSeconds: number,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' },
): string {
  return unixSecondsToDate(unixSeconds).toLocaleTimeString(undefined, { ...options, timeZone });
}
