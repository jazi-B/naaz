import pg from 'pg';

async function setPassword() {
  // Try connecting as current user
  const client = new pg.Client({
    host: '127.0.0.1',
    port: 5432,
    user: process.env.USERNAME || 'm_jaz',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PG!');
    await client.query("ALTER USER postgres WITH PASSWORD 'postgres';");
    await client.query("CREATE USER m_jaz WITH SUPERUSER PASSWORD 'postgres';").catch(() => {});
    await client.query("ALTER USER m_jaz WITH SUPERUSER PASSWORD 'postgres';").catch(() => {});
    console.log('Postgres passwords updated successfully!');
  } catch (err) {
    console.error('Err:', err.message);
  } finally {
    await client.end();
  }
}

setPassword();
