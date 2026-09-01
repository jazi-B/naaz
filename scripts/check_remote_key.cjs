const { Client } = require('pg');

const REMOTE_URL = 'postgresql://postgres:HjhOMsUcdgIJjKpvgAlgErvuzpnpSTyZ@tokaido.proxy.rlwy.net:12882/railway';

async function checkApiKey() {
  const client = new Client(REMOTE_URL);
  await client.connect();

  const keys = await client.query(`SELECT * FROM "api_key"`);
  console.log('API Keys on Remote:', keys.rows);

  const salesChannels = await client.query(`SELECT * FROM "sales_channel"`);
  console.log('Sales Channels on Remote:', salesChannels.rows);

  // Link api key to sales channel in publishable_api_key_sales_channel
  const scId = salesChannels.rows[0]?.id || 'sc_01M1BBBSMR276BA3WQ1W0GRP70';
  const keyId = keys.rows[0]?.id;

  if (keyId && scId) {
    try {
      await client.query(`
        INSERT INTO "publishable_api_key_sales_channel" ("api_key_id", "sales_channel_id")
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [keyId, scId]);
      console.log('✅ Linked API Key to Sales Channel!');
    } catch (e) {
      console.log('Note on linking:', e.message);
    }
  }

  await client.end();
}

checkApiKey().catch(console.error);
