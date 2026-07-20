const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateTOTP(secret) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
  for (let i = 0; i < cleanSecret.length; i++) {
    const val = base32chars.indexOf(cleanSecret.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  const key = Buffer.from(bytes);

  const epoch = Math.floor(Date.now() / 1000);
  const time = Buffer.alloc(8);
  time.writeBigInt64BE(BigInt(Math.floor(epoch / 30)));

  const hmac = crypto.createHmac('sha1', key).update(time).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  let code = ((hmac[offset] & 0x7f) << 24) |
             ((hmac[offset + 1] & 0xff) << 16) |
             ((hmac[offset + 2] & 0xff) << 8) |
             (hmac[offset + 3] & 0xff);
  code = code % 1000000;
  return code.toString().padStart(6, '0');
}

let scripMasterCache = null;

async function loadScripMaster() {
  if (scripMasterCache) return scripMasterCache;

  const cachePath = path.join(__dirname, '../data/scrip_master.json');
  
  // Ensure the directory exists
  const dir = path.dirname(cachePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check if local cache file exists
  if (fs.existsSync(cachePath)) {
    console.log('[AngelAPI] Loading scrip master from local cache file...');
    try {
      const content = fs.readFileSync(cachePath, 'utf8');
      scripMasterCache = JSON.parse(content);
      console.log(`[AngelAPI] Loaded ${scripMasterCache.length} instruments from local cache.`);
      return scripMasterCache;
    } catch (err) {
      console.error('[AngelAPI] Failed to parse local scrip master cache, refetching:', err.message);
    }
  }

  // If not, download it
  console.log('[AngelAPI] Downloading instrument scrip master from AngelOne (this may take a few seconds)...');
  try {
    const res = await fetch('https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json');
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    
    // Save to cache file asynchronously so we don't block
    fs.writeFile(cachePath, JSON.stringify(data), 'utf8', (err) => {
      if (err) console.error('[AngelAPI] Failed to save scrip master cache:', err.message);
      else console.log('[AngelAPI] Scrip master cached locally.');
    });

    scripMasterCache = data;
    console.log(`[AngelAPI] Downloaded and cached ${data.length} instruments.`);
    return data;
  } catch (err) {
    console.error('[AngelAPI] Failed to download scrip master:', err.message);
    return [];
  }
}

async function getInstrumentToken(symbol) {
  const master = await loadScripMaster();
  const cleanSym = symbol.toUpperCase().replace('.NS', '').replace('.BO', '').replace('NSE:', '').replace('BSE:', '');

  // Handle hardcoded indices
  if (cleanSym === 'NIFTY' || cleanSym === 'NSEI') {
    return { token: '99926000', exchange: 'NSE' };
  }
  if (cleanSym === 'BANKNIFTY' || cleanSym === 'NSEBANK') {
    return { token: '99926009', exchange: 'NSE' };
  }
  if (cleanSym === 'SENSEX' || cleanSym === 'BSESN') {
    return { token: '99919000', exchange: 'BSE' };
  }

  // Look for exact match like RELIANCE-EQ
  const targetSymbol = `${cleanSym}-EQ`;
  const match = master.find(inst => 
    inst.exch_seg === 'NSE' && inst.symbol === targetSymbol
  );

  if (match) {
    return { token: match.token, exchange: 'NSE' };
  }

  // Fallback: look for name match or search exchange BSE
  const bseMatch = master.find(inst => 
    inst.exch_seg === 'BSE' && inst.symbol === targetSymbol
  );
  if (bseMatch) {
    return { token: bseMatch.token, exchange: 'BSE' };
  }

  // Last-ditch: match by name
  const nameMatch = master.find(inst => inst.name === cleanSym);
  if (nameMatch) {
    return { token: nameMatch.token, exchange: nameMatch.exch_seg };
  }

  return null;
}

let sessionCache = {
  jwtToken: null,
  feedToken: null,
  timestamp: 0
};

async function getAngelSession() {
  const apiKey = process.env.ANGEL_ONE_API_KEY;
  const clientCode = process.env.ANGEL_ONE_CLIENT_CODE;
  const password = process.env.ANGEL_ONE_PASSWORD;
  const totpSecret = process.env.ANGEL_ONE_TOTP_SECRET;

  if (!apiKey || !clientCode || !password || !totpSecret) {
    throw new Error('AngelOne API credentials (ANGEL_ONE_CLIENT_CODE, ANGEL_ONE_PASSWORD, ANGEL_ONE_TOTP_SECRET, ANGEL_ONE_API_KEY) are not fully configured.');
  }

  // Cache session for 10 hours
  const now = Date.now();
  if (sessionCache.jwtToken && (now - sessionCache.timestamp < 10 * 60 * 60 * 1000)) {
    return sessionCache;
  }

  console.log(`[AngelAPI] Authenticating session for client: ${clientCode}...`);
  
  // Generate TOTP
  const totp = generateTOTP(totpSecret);
  
  const loginUrl = 'https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '127.0.0.1',
    'X-ClientPublicIP': '127.0.0.1',
    'X-MACAddress': '00:00:00:00:00:00',
    'X-PrivateKey': apiKey
  };

  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      clientcode: clientCode,
      password: password,
      totp: totp
    })
  });

  const loginData = await loginRes.json();
  if (!loginData.status || !loginData.data || !loginData.data.jwtToken) {
    throw new Error(loginData.message || 'AngelOne API Authentication failed.');
  }

  sessionCache = {
    jwtToken: loginData.data.jwtToken,
    feedToken: loginData.data.feedToken,
    timestamp: now
  };

  console.log('[AngelAPI] Session authenticated successfully.');
  return sessionCache;
}

function mapIntervalToAngel(interval) {
  switch (interval) {
    case '1m': return 'ONE_MINUTE';
    case '3m': return 'THREE_MINUTE';
    case '5m': return 'FIVE_MINUTE';
    case '15m': return 'FIFTEEN_MINUTE';
    case '30m': return 'THIRTY_MINUTE';
    case '60m':
    case '1h': return 'ONE_HOUR';
    case '1d': return 'ONE_DAY';
    default: return 'ONE_DAY';
  }
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

async function fetchAngelHistory(symbol, range, interval) {
  const { jwtToken } = await getAngelSession();
  const inst = await getInstrumentToken(symbol);
  if (!inst) {
    throw new Error(`Instrument token not found for symbol: ${symbol}`);
  }

  const angelInterval = mapIntervalToAngel(interval);
  
  const toDate = new Date();
  const fromDate = new Date();
  
  switch (range) {
    case '1d': fromDate.setDate(toDate.getDate() - 1); break;
    case '5d': fromDate.setDate(toDate.getDate() - 5); break;
    case '7d': fromDate.setDate(toDate.getDate() - 7); break;
    case '1mo': fromDate.setDate(toDate.getDate() - 30); break;
    case '3mo': fromDate.setDate(toDate.getDate() - 90); break;
    case '6mo': fromDate.setDate(toDate.getDate() - 180); break;
    case '1y': fromDate.setDate(toDate.getDate() - 365); break;
    case '2y': fromDate.setDate(toDate.getDate() - 730); break;
    case '5y': fromDate.setDate(toDate.getDate() - 1825); break;
    default: fromDate.setDate(toDate.getDate() - 365);
  }

  // Constrain requested dates to AngelOne API maximum query limitations
  const maxDays = {
    'ONE_MINUTE': 30,
    'THREE_MINUTE': 30,
    'FIVE_MINUTE': 30,
    'FIFTEEN_MINUTE': 30,
    'THIRTY_MINUTE': 30,
    'ONE_HOUR': 30,
    'ONE_DAY': 2000
  };
  const allowedMaxDays = maxDays[angelInterval] || 365;
  const requestedDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  if (requestedDays > allowedMaxDays) {
    fromDate.setTime(toDate.getTime() - allowedMaxDays * 24 * 60 * 60 * 1000);
  }

  const payload = {
    exchange: inst.exchange,
    symboltoken: inst.token,
    interval: angelInterval,
    fromdate: formatDate(fromDate),
    todate: formatDate(toDate)
  };

  console.log(`[AngelAPI] Requesting candles for ${symbol} (${inst.token}) from ${payload.fromdate} to ${payload.todate}`);

  const apiKey = process.env.ANGEL_ONE_API_KEY;
  const url = 'https://apiconnect.angelone.in/rest/secure/angelbroking/historical/v1/getCandleData';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '127.0.0.1',
    'X-ClientPublicIP': '127.0.0.1',
    'X-MACAddress': '00:00:00:00:00:00',
    'X-PrivateKey': apiKey,
    'Authorization': `Bearer ${jwtToken}`
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const resData = await res.json();
  if (!resData.status || !resData.data) {
    throw new Error(resData.message || 'Failed to fetch historical data from AngelOne.');
  }

  return resData.data.map(c => {
    return {
      time: new Date(c[0]).getTime(),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseInt(c[5]) || 0
    };
  });
}

function isAngelConfigured() {
  return !!(
    process.env.ANGEL_ONE_API_KEY &&
    process.env.ANGEL_ONE_CLIENT_CODE &&
    process.env.ANGEL_ONE_PASSWORD &&
    process.env.ANGEL_ONE_TOTP_SECRET
  );
}

module.exports = {
  fetchAngelHistory,
  isAngelConfigured
};
