require('dotenv').config();
const { query } = require('./src/db/index');

async function main() {
  const tablesRes = await query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log('Tables:', tables);

  for (const table of tables) {
    const colsRes = await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
    console.log(`\nTable: ${table}`);
    console.log(colsRes.rows.map(r => `${r.column_name} (${r.data_type})`));
  }
}

main().catch(console.error);
