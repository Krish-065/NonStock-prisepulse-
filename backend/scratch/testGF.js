const axios = require('axios');
const cheerio = require('cheerio');

async function testGF() {
    try {
        const url = 'https://www.google.com/finance/quote/NIFTY_50:INDEXNSE';
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }});
        const $ = cheerio.load(res.data);
        const priceStr = $('.YMlKec.fxKbKc').text();
        const price = parseFloat(priceStr.replace(/,/g, ''));
        
        // Find change
        const changeStr = $('.P2Luy.JwB6zf').first().text();
        console.log(`NIFTY 50 Price: ${price}`);
        console.log(`Change info: ${changeStr}`);
    } catch (err) {
        console.error(err.message);
    }
}
testGF();
