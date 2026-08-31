import pg from 'pg';

async function setup() {
  const client = new pg.Client({
    host: '127.0.0.1',
    port: 5432,
    user: process.env.USERNAME || 'm_jaz',
    password: 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');
    const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'medusa_naaz'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE medusa_naaz');
      console.log('Database medusa_naaz created!');
    } else {
      console.log('Database medusa_naaz exists.');
    }
  } catch (err) {
    console.error('PG Setup Error:', err.message);
  } finally {
    await client.end();
  }
}

setup();
