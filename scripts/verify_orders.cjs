const { Client } = require('pg');

async function verifyOrders() {
  const client = new Client('postgres://postgres:postgres@localhost:5432/medusa_naaz');
  await client.connect();

  const orders = await client.query(`
    SELECT * FROM "order"
    ORDER BY created_at DESC
    LIMIT 5
  `);

  console.log('--- RECENT ORDERS IN DATABASE ---');
  console.log(orders.rows);

  const orderItems = await client.query(`
    SELECT * FROM order_item
    ORDER BY created_at DESC
    LIMIT 5
  `);
  console.log('\n--- ORDER ITEMS ---');
  console.log(orderItems.rows);

  const addresses = await client.query(`
    SELECT * FROM order_address
    ORDER BY created_at DESC
    LIMIT 5
  `);
  console.log('\n--- SHIPPING ADDRESSES ---');
  console.log(addresses.rows);

  await client.end();
}

verifyOrders().catch(console.error);
