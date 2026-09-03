require('dotenv').config({ path: 'd:/prisepulse/backend/.env' });
const { fetchAngelHistory } = require('d:/prisepulse/backend/src/services/angelApi');

async function testAngel() {
    try {
        // Just fetching a 1d candle for today to get the latest close price
        const data = await fetchAngelHistory('NIFTY', '1d', '1m');
        if (data && data.length > 0) {
            const lastCandle = data[data.length - 1];
            console.log("AngelOne NIFTY Live Candle:", lastCandle);
        } else {
            console.log("No data returned");
        }
    } catch(err) {
        console.error("Angel Error:", err.message);
    }
}
testAngel();
