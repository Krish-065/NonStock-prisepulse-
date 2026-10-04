/**
 * marketHours.js — Real-Time Global Market Sessions Engine
 * Computes exact market hours, open/close status, and countdowns for:
 * - New York (NYSE / NASDAQ)
 * - London (LSE)
 * - Tokyo (TSE)
 * - Sydney (ASX)
 */

export const SESSIONS_CONFIG = [
  {
    id: 'new_york',
    name: 'New York',
    exchange: 'NYSE / NASDAQ',
    country: 'United States',
    flag: '🇺🇸',
    city: 'New York',
    timezone: 'America/New_York',
    lat: 40.7128,
    lon: -74.0060,
    openUtcHour: 13,
    openUtcMinute: 30,
    closeUtcHour: 20,
    closeUtcMinute: 0,
    mapX: 25, // % position on world map projection
    mapY: 36
  },
  {
    id: 'london',
    name: 'London',
    exchange: 'LSE / FTSE',
    country: 'United Kingdom',
    flag: '🇬🇧',
    city: 'London',
    timezone: 'Europe/London',
    lat: 51.5074,
    lon: -0.1278,
    openUtcHour: 8,
    openUtcMinute: 0,
    closeUtcHour: 16,
    closeUtcMinute: 30,
    mapX: 47,
    mapY: 28
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    exchange: 'TSE / Nikkei',
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Tokyo',
    timezone: 'Asia/Tokyo',
    lat: 35.6762,
    lon: 139.6503,
    openUtcHour: 0,
    openUtcMinute: 0,
    closeUtcHour: 6,
    closeUtcMinute: 0,
    mapX: 84,
    mapY: 38
  },
  {
    id: 'sydney',
    name: 'Sydney',
    exchange: 'ASX',
    country: 'Australia',
    flag: '🇦🇺',
    city: 'Sydney',
    timezone: 'Australia/Sydney',
    lat: -33.8688,
    lon: 151.2093,
    openUtcHour: 22,
    openUtcMinute: 0,
    closeUtcHour: 5,
    closeUtcMinute: 0, // Crosses midnight UTC
    mapX: 88,
    mapY: 76
  }
];

export function getSessionStatus(session, now = new Date()) {
  const currentMinutesToday = now.getUTCHours() * 60 + now.getUTCMinutes();
  const openMinutes = session.openUtcHour * 60 + session.openUtcMinute;
  const closeMinutes = session.closeUtcHour * 60 + session.closeUtcMinute;

  let isOpen = false;
  let minutesUntilEvent = 0;
  let isClosingNext = false;

  if (openMinutes < closeMinutes) {
    // Standard same-day window (London, New York, Tokyo)
    if (currentMinutesToday >= openMinutes && currentMinutesToday < closeMinutes) {
      isOpen = true;
      isClosingNext = true;
      minutesUntilEvent = closeMinutes - currentMinutesToday;
    } else if (currentMinutesToday < openMinutes) {
      isOpen = false;
      isClosingNext = false;
      minutesUntilEvent = openMinutes - currentMinutesToday;
    } else {
      isOpen = false;
      isClosingNext = false;
      minutesUntilEvent = (24 * 60 - currentMinutesToday) + openMinutes;
    }
  } else {
    // Overnight window crossing UTC midnight (Sydney: 22:00 -> 05:00)
    if (currentMinutesToday >= openMinutes || currentMinutesToday < closeMinutes) {
      isOpen = true;
      isClosingNext = true;
      if (currentMinutesToday >= openMinutes) {
        minutesUntilEvent = (24 * 60 - currentMinutesToday) + closeMinutes;
      } else {
        minutesUntilEvent = closeMinutes - currentMinutesToday;
      }
    } else {
      isOpen = false;
      isClosingNext = false;
      minutesUntilEvent = openMinutes - currentMinutesToday;
    }
  }

  const hours = Math.floor(minutesUntilEvent / 60);
  const mins = minutesUntilEvent % 60;
  const countdownText = isClosingNext
    ? `closes in ${hours > 0 ? `${hours}h ` : ''}${mins}m`
    : `opens in ${hours > 0 ? `${hours}h ` : ''}${mins}m`;

  // Local time formatted in session's timezone
  let localTimeStr = '';
  try {
    localTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: session.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);
  } catch {
    localTimeStr = '--:--';
  }

  // Calculate Sun position over session longitude to determine daylight / morning
  const sunLon = 180 - ((now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60) / 1440) * 360;
  let lonDiff = Math.abs(session.lon - sunLon);
  if (lonDiff > 180) lonDiff = 360 - lonDiff;
  const isDaylight = lonDiff <= 90;

  return {
    ...session,
    isOpen,
    countdownText,
    isClosingNext,
    minutesUntilEvent,
    localTimeStr,
    isDaylight
  };
}

export function getAllMarketSessions(now = new Date()) {
  return SESSIONS_CONFIG.map(s => getSessionStatus(s, now));
}
