const { Client } = require('pg');

async function cleanCategories() {
  const client = new Client('postgres://postgres:postgres@localhost:5432/medusa_naaz');
  await client.connect();

  await client.query("DELETE FROM product_category WHERE handle IN ('shirts', 'sweatshirts', 'pants', 'merch')");
  
  const res = await client.query("SELECT id, name, handle FROM product_category WHERE deleted_at IS NULL ORDER BY rank ASC");
  console.log('✅ Active Categories in Medusa:', res.rows);

  const prodCount = await client.query("SELECT COUNT(*) FROM product");
  console.log('✅ Total Real Markaz Products in Medusa:', prodCount.rows[0].count);

  await client.end();
}

cleanCategories().catch(console.error);
