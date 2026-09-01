const { Client } = require('pg');

const REMOTE_URL = 'postgresql://postgres:HjhOMsUcdgIJjKpvgAlgErvuzpnpSTyZ@tokaido.proxy.rlwy.net:12882/railway';

async function linkAllProductsToAllChannels() {
  const client = new Client(REMOTE_URL);
  await client.connect();

  const products = await client.query(`SELECT id FROM "product"`);
  const salesChannels = await client.query(`SELECT id FROM "sales_channel"`);

  console.log(`Linking ${products.rows.length} products to ${salesChannels.rows.length} sales channels...`);

  for (const p of products.rows) {
    for (const sc of salesChannels.rows) {
      const linkId = `psc_${p.id.slice(5, 15)}_${sc.id.slice(3, 10)}`;
      await client.query(`
        INSERT INTO "product_sales_channel" ("id", "product_id", "sales_channel_id")
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING;
      `, [linkId, p.id, sc.id]);
    }
  }

  const count = await client.query(`SELECT count(*) FROM "product_sales_channel"`);
  console.log(`✅ Total active product-sales-channel links: ${count.rows[0].count}`);

  await client.end();
}

linkAllProductsToAllChannels().catch(console.error);
