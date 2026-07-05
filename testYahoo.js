async function test() {
  try {
    const url = `http://localhost:3000/market/stock-history/C2C-SM?range=3mo&interval=1d`;
    console.log("FETCHING FROM:", url);
    const response = await fetch(url);
    if (!response.ok) {
      console.log("SERVER NOT RUNNING OR RETURNED ERROR:", response.status);
      return;
    }
    const data = await response.json();
    console.log("HISTORY LENGTH RECEIVED:", data.length);
    console.log("FIRST BAR:", data[0]);
    console.log("LAST BAR:", data[data.length - 1]);
  } catch (err) {
    console.log("FETCH ERROR:", err.message);
  }
}

test();
