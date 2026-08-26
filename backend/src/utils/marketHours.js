/**
 * Checks if the Indian Equity Market (NSE/BSE) is currently open for trading.
 * NSE Regular Trading Hours: Monday to Friday, 9:15 AM to 3:30 PM IST (09:15 - 15:30 IST)
 */
function isIndianMarketOpen() {
  const now = new Date();
  // Convert current time to IST (UTC+5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (360 * 60000));
  
  const day = ist.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return false;

  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // 9:15 AM = 555 mins, 3:30 PM = 930 mins
  return timeInMinutes >= 555 && timeInMinutes <= 930;
}

module.exports = { isIndianMarketOpen };
