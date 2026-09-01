const { Client } = require('pg');

const REMOTE_URL = 'postgresql://postgres:HjhOMsUcdgIJjKpvgAlgErvuzpnpSTyZ@tokaido.proxy.rlwy.net:12882/railway';

async function linkPakistanCountry() {
  const client = new Client(REMOTE_URL);
  await client.connect();

  console.log('Linking Pakistan country to Pakistan region...');
  await client.query(`
    UPDATE "region_country"
    SET "region_id" = 'reg_01NAAZPAKISTAN000000000000'
    WHERE "iso_2" = 'pk';
  `);

  const res = await client.query(`SELECT * FROM "region_country" WHERE "iso_2" = 'pk'`);
  console.log('Pakistan Country in DB:', res.rows);

  await client.end();
}

linkPakistanCountry().catch(console.error);
