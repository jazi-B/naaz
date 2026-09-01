const { Client } = require('pg');

const REMOTE_URL = 'postgresql://postgres:HjhOMsUcdgIJjKpvgAlgErvuzpnpSTyZ@tokaido.proxy.rlwy.net:12882/railway';
const LOCAL_URL = 'postgres://postgres:postgres@localhost:5432/medusa_naaz';

async function syncApiKeys() {
  const localClient = new Client(LOCAL_URL);
  const remoteClient = new Client(REMOTE_URL);

  await localClient.connect();
  await remoteClient.connect();

  const tables = ['api_key', 'api_key_sales_channel'];
  for (const table of tables) {
    try {
      const localData = await localClient.query(`SELECT * FROM "${table}"`);
      console.log(`Syncing ${table} (${localData.rows.length} rows)...`);
      for (const row of localData.rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const colNames = columns.map(c => `"${c}"`).join(', ');
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        await remoteClient.query(`INSERT INTO "${table}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
      }
      console.log(`✅ ${table} synced successfully!`);
    } catch (e) {
      console.error(`Error on ${table}:`, e.message);
    }
  }

  await localClient.end();
  await remoteClient.end();
}

syncApiKeys();
