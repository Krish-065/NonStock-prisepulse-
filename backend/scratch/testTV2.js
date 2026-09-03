const axios = require('axios');

async function testTV() {
    try {
        const payload = {
            "columns": ["name", "close", "change", "change_abs", "high", "low", "volume", "description"],
            "filter": [{"left": "name", "operation": "in_range", "right": ["NIFTY", "BANKNIFTY", "SENSEX", "NIFTY_50", "INDIAVIX"]}],
            "range": [0, 10],
            "sort": {"sortBy": "name", "sortOrder": "asc"}
        };
        const res = await axios.post('https://scanner.tradingview.com/india/scan', payload);
        console.log(JSON.stringify(res.data, null, 2));

        // Test global scanner for NIFTY
        const globalPayload = {
            "columns": ["name", "close", "change"],
            "filter": [{"left": "name", "operation": "match", "right": "NIFTY"}],
            "range": [0, 10]
        };
        const res2 = await axios.post('https://scanner.tradingview.com/global/scan', globalPayload);
        console.log("Global Scan:", JSON.stringify(res2.data, null, 2));

    } catch (err) {
        console.error(err.message);
    }
}
testTV();
