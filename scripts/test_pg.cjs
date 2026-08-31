const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL is running and connected successfully!');
    const res = await client.query('SELECT current_database(), version()');
    console.log('DB:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.log('❌ PostgreSQL connection failed:', err.message);
  }
}

test();
