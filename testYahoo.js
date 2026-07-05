const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

async function test(range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/C2C-SM.NS?range=${range}&interval=${interval}`;
  const response = await fetch(url, { headers: YAHOO_HEADERS });
  const data = await response.json();
  const result = data?.chart?.result?.[0];
  console.log(`INTERVAL: ${interval} | RANGE: ${range} | TIMESTAMPS LENGTH:`, result?.timestamp?.length);
  if (result?.timestamp && result.timestamp.length > 0) {
    console.log("FIRST DATE:", new Date(result.timestamp[0] * 1000).toLocaleString('en-IN'));
    console.log("LAST DATE:", new Date(result.timestamp[result.timestamp.length - 1] * 1000).toLocaleString('en-IN'));
  }
}

async function run() {
  await test('5d', '5m');
  await test('1d', '1m');
}

run();
