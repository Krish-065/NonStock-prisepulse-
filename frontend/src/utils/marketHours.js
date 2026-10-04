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
    mapX: 25,
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
    closeUtcMinute: 0,
    mapX: 88,
    mapY: 76
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    exchange: 'Deutsche Börse / DAX',
    country: 'Germany',
    flag: '🇩🇪',
    city: 'Frankfurt',
    timezone: 'Europe/Berlin',
    lat: 50.1109,
    lon: 8.6821,
    openUtcHour: 7,
    openUtcMinute: 0,
    closeUtcHour: 15,
    closeUtcMinute: 30,
    mapX: 51,
    mapY: 30
  },
  {
    id: 'hong_kong',
    name: 'Hong Kong',
    exchange: 'HKEX / Hang Seng',
    country: 'Hong Kong',
    flag: '🇭🇰',
    city: 'Hong Kong',
    timezone: 'Asia/Hong_Kong',
    lat: 22.3193,
    lon: 114.1694,
    openUtcHour: 1,
    openUtcMinute: 30,
    closeUtcHour: 8,
    closeUtcMinute: 0,
    mapX: 80,
    mapY: 48
  },
  {
    id: 'singapore',
    name: 'Singapore',
    exchange: 'SGX',
    country: 'Singapore',
    flag: '🇸🇬',
    city: 'Singapore',
    timezone: 'Asia/Singapore',
    lat: 1.3521,
    lon: 103.8198,
    openUtcHour: 1,
    openUtcMinute: 0,
    closeUtcHour: 9,
    closeUtcMinute: 0,
    mapX: 78,
    mapY: 58
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    exchange: 'NSE / BSE',
    country: 'India',
    flag: '🇮🇳',
    city: 'Mumbai',
    timezone: 'Asia/Kolkata',
    lat: 19.0760,
    lon: 72.8777,
    openUtcHour: 3,
    openUtcMinute: 45,
    closeUtcHour: 10,
    closeUtcMinute: 0,
    mapX: 68,
    mapY: 46
  },
  {
    id: 'dubai',
    name: 'Dubai',
    exchange: 'DFM / ADX',
    country: 'UAE',
    flag: '🇦🇪',
    city: 'Dubai',
    timezone: 'Asia/Dubai',
    lat: 25.2048,
    lon: 55.2708,
    openUtcHour: 6,
    openUtcMinute: 0,
    closeUtcHour: 11,
    closeUtcMinute: 0,
    mapX: 63,
    mapY: 42
  },
  {
    id: 'zurich',
    name: 'Zurich',
    exchange: 'SIX Swiss',
    country: 'Switzerland',
    flag: '🇨🇭',
    city: 'Zurich',
    timezone: 'Europe/Zurich',
    lat: 47.3769,
    lon: 8.5417,
    openUtcHour: 8,
    openUtcMinute: 0,
    closeUtcHour: 16,
    closeUtcMinute: 30,
    mapX: 50,
    mapY: 32
  },
  {
    id: 'toronto',
    name: 'Toronto',
    exchange: 'TSX',
    country: 'Canada',
    flag: '🇨🇦',
    city: 'Toronto',
    timezone: 'America/Toronto',
    lat: 43.6532,
    lon: -79.3832,
    openUtcHour: 13,
    openUtcMinute: 30,
    closeUtcHour: 20,
    closeUtcMinute: 0,
    mapX: 24,
    mapY: 32
  },
  {
    id: 'sao_paulo',
    name: 'São Paulo',
    exchange: 'B3',
    country: 'Brazil',
    flag: '🇧🇷',
    city: 'São Paulo',
    timezone: 'America/Sao_Paulo',
    lat: -23.5505,
    lon: -46.6333,
    openUtcHour: 13,
    openUtcMinute: 0,
    closeUtcHour: 20,
    closeUtcMinute: 0,
    mapX: 34,
    mapY: 72
  },
  {
    id: 'chicago',
    name: 'Chicago',
    exchange: 'CME / CBOE',
    country: 'United States',
    flag: '🇺🇸',
    city: 'Chicago',
    timezone: 'America/Chicago',
    lat: 41.8781,
    lon: -87.6298,
    openUtcHour: 14,
    openUtcMinute: 30,
    closeUtcHour: 21,
    closeUtcMinute: 0,
    mapX: 22,
    mapY: 35
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
