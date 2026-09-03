const axios = require('axios');

async function testTV() {
    try {
        const payload = {
            "columns": ["name", "close", "change", "change_abs", "high", "low", "volume"],
            "filter": [{"left": "name", "operation": "in_range", "right": ["NIFTY", "BANKNIFTY", "SENSEX", "CNXIT"]}],
            "range": [0, 10],
            "sort": {"sortBy": "name", "sortOrder": "asc"}
        };
        const res = await axios.post('https://scanner.tradingview.com/india/scan', payload);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error(err.message);
    }
}
testTV();
