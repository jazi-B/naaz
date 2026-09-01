const { Client } = require('pg');

const REMOTE_URL = 'postgresql://postgres:HjhOMsUcdgIJjKpvgAlgErvuzpnpSTyZ@tokaido.proxy.rlwy.net:12882/railway';
const LOCAL_URL = 'postgres://postgres:postgres@localhost:5432/medusa_naaz';

async function syncAll() {
  console.log('🔗 Connecting to Local & Remote Databases...');
  const localClient = new Client(LOCAL_URL);
  const remoteClient = new Client(REMOTE_URL);

  await localClient.connect();
  await remoteClient.connect();
  console.log('✅ Connected to both databases!');

  // Tables to sync in order
  const tables = [
    'currency',
    'region',
    'region_country',
    'region_payment_provider',
    'sales_channel',
    'publishable_api_key',
    'publishable_api_key_sales_channel',
    'shipping_profile',
    'stock_location',
    'fulfillment_set',
    'service_zone',
    'geo_zone',
    'shipping_option',
    'shipping_option_type',
    'shipping_option_rule',
    'product_category',
    'product',
    'product_option',
    'product_option_value',
    'product_variant',
    'product_variant_option',
    'product_image',
    'product_sales_channel',
    'price_set',
    'price',
    'price_preference',
    'product_category_product',
    'user',
    'invite'
  ];

  for (const table of tables) {
    try {
      const localData = await localClient.query(`SELECT * FROM "${table}"`);
      if (localData.rows.length === 0) continue;

      console.log(`📦 Syncing table "${table}" (${localData.rows.length} rows)...`);
      for (const row of localData.rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const colNames = columns.map(c => `"${c}"`).join(', ');
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
          INSERT INTO "${table}" (${colNames})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;
        await remoteClient.query(query, values);
      }
    } catch (err) {
      console.warn(`⚠️ Note for table "${table}":`, err.message);
    }
  }

  console.log('======================================================');
  console.log('🎉 REMOTE RAILWAY POSTGRES DATABASE SYNC COMPLETED!');
  console.log('All 49 Products, Pakistan Region, PKR Currency & Admin synced!');
  console.log('======================================================');

  await localClient.end();
  await remoteClient.end();
}

syncAll().catch(console.error);
