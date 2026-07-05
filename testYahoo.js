const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

async function test() {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/C2C-SM.NS?range=1mo&interval=1d`;
  const response = await fetch(url, { headers: YAHOO_HEADERS });
  const data = await response.json();
  const result = data?.chart?.result?.[0];
  if (result?.timestamp) {
    console.log("TOTAL DAYS:", result.timestamp.length);
    for (let i = 0; i < result.timestamp.length; i++) {
      const date = new Date(result.timestamp[i] * 1000).toLocaleDateString('en-IN');
      console.log(`DATE: ${date} | CLOSE: ${result.indicators.quote[0].close[i]}`);
    }
  } else {
    console.log("NO DATA");
  }
}

test();
