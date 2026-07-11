const { query } = require('./index');

async function run() {
  try {
    console.log('Fetching price_alerts table info...');
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'price_alerts'
    `);
    console.log('Columns in price_alerts:');
    result.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));

    console.log('\nRunning alterations to ensure columns exist...');
    await query(`ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);
    await query(`ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'in-app'`);
    await query(`ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50) DEFAULT 'price'`);
    await query(`ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS indicator_period INTEGER DEFAULT 14`);
    
    console.log('Alterations run successfully. Re-fetching column info...');
    const result2 = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'price_alerts'
    `);
    result2.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
  } catch (err) {
    console.error('Error running test script:', err);
  } finally {
    process.exit();
  }
}

run();
