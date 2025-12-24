// /js/core/utils.js

export function normalizeText(v) {
  return (v ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function jobTitleMatch(jobTitles, expected) {
  const list = Array.isArray(jobTitles) ? jobTitles : [];
  const set = new Set(list.map(normalizeText));
  return set.has(normalizeText(expected));
}

export function jobTitleAnyMatch(jobTitles, expectedList) {
  const list = Array.isArray(expectedList) ? expectedList : [];
  return list.some(e => jobTitleMatch(jobTitles, e));
}

export function isWithinSchedule(profile) {
  // If schedule not configured, allow.
  const days = Array.isArray(profile.allowedDays) ? profile.allowedDays : [];
  const shiftStart = profile.shiftStart;
  const shiftEnd = profile.shiftEnd;

  if (!days.length && !shiftStart && !shiftEnd) return true;

  const now = new Date();

  if (days.length) {
    // Support Spanish day names: Lunes... Domingo
    const dayMap = {
      0: ['domingo'],
      1: ['lunes'],
      2: ['martes'],
      3: ['miercoles', 'miércoles'],
      4: ['jueves'],
      5: ['viernes'],
      6: ['sabado', 'sábado']
    };
    const today = dayMap[now.getDay()] || [];
    const allowed = new Set(days.map(normalizeText));
    const okDay = today.some(d => allowed.has(normalizeText(d)));
    if (!okDay) return false;
  }

  if (shiftStart && shiftEnd) {
    // expects "HH:MM" in 24h
    const [sh, sm] = shiftStart.split(':').map(Number);
    const [eh, em] = shiftEnd.split(':').map(Number);
    if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return true; // ignore bad config

    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    // If crosses midnight, allow if after start or before end
    if (end < start) {
      return minutesNow >= start || minutesNow <= end;
    }
    return minutesNow >= start && minutesNow <= end;
  }

  return true;
}
