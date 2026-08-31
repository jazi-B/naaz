const { Client } = require('pg');

async function getOrGenerateKey() {
  const client = new Client({
    connectionString: 'postgres://postgres:postgres@localhost:5432/medusa_naaz'
  });

  await client.connect();

  // Find existing publishable key
  const res = await client.query("SELECT * FROM api_key WHERE type = 'publishable'");
  console.log('Found keys:', res.rows);

  if (res.rows.length > 0) {
    const key = res.rows[0].token;
    console.log('ACTIVE_PUBLISHABLE_KEY=' + key);
  } else {
    console.log('No publishable key found, creating one...');
    const token = 'pk_2a9be57841bf0dc8f523ffc6ac5fd1a037cdbb3db9212ff57962e185c5839b68';
    const id = 'apk_01M1KEYNAAZPUBLISHABLE001';
    
    // Check if sales channel exists
    const sc = await client.query("SELECT id FROM sales_channel LIMIT 1");
    const scId = sc.rows[0]?.id;
    console.log('Sales channel ID:', scId);

    await client.query(`
      INSERT INTO api_key (id, token, type, title, created_by, created_at, updated_at)
      VALUES ($1, $2, 'publishable', 'Web Storefront', 'usr_admin', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [id, token]);

    if (scId) {
      await client.query(`
        INSERT INTO publishable_api_key_sales_channel (id, api_key_id, sales_channel_id, created_at, updated_at)
        VALUES ('paksc_01', $1, $2, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [id, scId]);
    }
    console.log('ACTIVE_PUBLISHABLE_KEY=' + token);
  }

  await client.end();
}

getOrGenerateKey().catch(console.error);
