const { Client } = require('pg');

const REMOTE_URL = 'postgresql://postgres:HjhOMsUcdgIJjKpvgAlgErvuzpnpSTyZ@tokaido.proxy.rlwy.net:12882/railway';

async function checkColumns() {
  const client = new Client(REMOTE_URL);
  await client.connect();

  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'publishable_api_key_sales_channel'
  `);
  console.log('Columns in publishable_api_key_sales_channel:', cols.rows);

  const existing = await client.query(`SELECT * FROM "publishable_api_key_sales_channel"`);
  console.log('Existing links in publishable_api_key_sales_channel:', existing.rows);

  await client.end();
}

checkColumns().catch(console.error);
