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

