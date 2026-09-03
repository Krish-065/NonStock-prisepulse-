async function testMC() {
    try {
        const res = await fetch('https://priceapi.moneycontrol.com/pricefeed/nse/indexcash/NIFTY');
        const data = await res.json();
        console.log(data);
    } catch(err) {
        console.error(err.message);
    }
}
testMC();
