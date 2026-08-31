import pg from 'pg';

async function createDb() {
  const client = new pg.Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL root database.');
    const checkRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'medusa_naaz'");
    if (checkRes.rowCount === 0) {
      await client.query('CREATE DATABASE medusa_naaz');
      console.log('Database medusa_naaz created successfully!');
    } else {
      console.log('Database medusa_naaz already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }
}

createDb();
