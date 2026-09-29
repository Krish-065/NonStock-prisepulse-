// Helper to determine if a symbol is an Indian stock/index (native currency is INR)
const isIndianSymbol = (symbol) => {
  if (!symbol) return false;
  let s = symbol.toUpperCase().trim();
  if (s.includes(':')) {
    s = s.split(':')[1];
  }
  if (s.endsWith('.NS') || s.endsWith('.BO')) {
    s = s.slice(0, -3);
  }
  const isCrypto = s.endsWith('-USD') || s.endsWith('-USDT') || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'BNB', 'SHIB', 'AVAX', 'TRX'].includes(s) || s.includes('-USD') || s.includes('USDT');
  const isForex = s.endsWith('=X') || (s.includes('USD') && s.includes('INR')) || s.includes('EURUSD') || s.includes('GBPUSD');
  const isCommodity = s.endsWith('=F') || ['GC', 'CL'].includes(s);
  const globalIndices = ['DJI', '^DJI', 'DOW', 'DOWJONES', 'SPX', '^GSPC', 'GSPC', 'IXIC', '^IXIC', 'NDX', '^NDX', 'NASDAQ', 'FTSE', '^FTSE', 'N225', '^N225', 'DAX', '^DAX', 'HSI', '^HSI', 'SPY', 'QQQ', 'DIA', 'IWM'];
  const usTickers = ['AAPL', 'MSFT', 'TSLA', 'GOOG', 'AMZN', 'META', 'NFLX', 'NVDA', 'AMD', 'INTC', 'COIN', 'MSTR', 'PLTR'];
  if (isCrypto || isForex || isCommodity || globalIndices.includes(s) || usTickers.includes(s)) return false;
  return true; // Default to true for Indian equities
};

// Normalize symbol to consistent Yahoo Finance ticker format
const normalizeSymbol = (symbol) => {
  if (!symbol) return '';
  let s = symbol.toUpperCase().trim();

  // Strip prefixes like NSE: or BSE: or BINANCE: if present
  if (s.includes(':')) {
    s = s.split(':')[1];
  }

  let cleanS = s;
  if (cleanS.endsWith('.NS') || cleanS.endsWith('.BO')) {
    cleanS = cleanS.slice(0, -3);
  }

  // Global Indices
  if (cleanS === 'DJI' || cleanS === '^DJI' || cleanS === 'DOW' || cleanS === 'DOWJONES' || cleanS === 'DOW JONES') return '^DJI';
  if (cleanS === 'SPX' || cleanS === '^GSPC' || cleanS === 'GSPC' || cleanS === 'SP500' || cleanS === 'S&P 500') return '^GSPC';
  if (cleanS === 'IXIC' || cleanS === '^IXIC' || cleanS === 'NDX' || cleanS === '^NDX' || cleanS === 'NASDAQ') return '^IXIC';
  if (cleanS === 'FTSE' || cleanS === '^FTSE') return '^FTSE';
  if (cleanS === 'N225' || cleanS === '^N225') return '^N225';
  if (cleanS === 'DAX' || cleanS === '^DAX') return '^GDAXI';
  if (cleanS === 'HSI' || cleanS === '^HSI') return '^HSI';

  // Major ETFs
  if (['SPY', 'QQQ', 'DIA', 'IWM'].includes(cleanS)) return cleanS;

  // Mappings for Index
  const indexMap = {
    'NIFTY50': '^NSEI', 'NIFTY': '^NSEI', 'SENSEX': '^BSESN',
    'BANKNIFTY': '^NSEBANK', 'NIFTYBANK': '^NSEBANK', 'NIFTYIT': '^CNXIT', 'NSEI': '^NSEI', 'BSESN': '^BSESN'
  };
  if (indexMap[cleanS]) {
    return indexMap[cleanS];
  }

  // Mappings for Crypto
  const cleanCrypto = cleanS.replace('-USD', '').replace('-USDT', '');
  const cryptos = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'BNB', 'SHIB', 'AVAX', 'TRX'];
  if (cryptos.includes(cleanCrypto)) {
    return `${cleanCrypto}-USD`;
  }

  // Mappings for Forex
  const cleanForex = cleanS.replace('=X', '');
  const forexPairs = ['EURUSD', 'GBPUSD', 'USDINR', 'AUDUSD', 'USDCAD', 'USDCHF'];
  if (forexPairs.includes(cleanForex)) {
    return `${cleanForex}=X`;
  }
  if (cleanS === 'INR') {
    return 'INR=X';
  }

  // Mappings for Commodities
  const cleanComm = cleanS.replace('=F', '');
  const commodities = ['GC', 'CL'];
  if (commodities.includes(cleanComm)) {
    return `${cleanComm}=F`;
  }

  // Mappings for US Equities
  const usTickers = ['AAPL', 'MSFT', 'TSLA', 'GOOG', 'AMZN', 'META', 'NFLX', 'NVDA', 'AMD', 'INTC', 'COIN', 'MSTR', 'PLTR'];
  if (usTickers.includes(cleanS)) {
    return cleanS;
  }

  // Default to Indian Equity format (TICKER.NS)
  if (!s.endsWith('.NS') && !s.endsWith('.BO')) {
    s = `${s}.NS`;
  }
  return s;
};

module.exports = {
  isIndianSymbol,
  normalizeSymbol
};
