import { PostgresInstance } from 'pg-embedded';

async function startPostgres() {
  console.log('Starting Embedded PostgreSQL 16 server on port 5432...');
  const instance = new PostgresInstance({
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'postgres'
  });

  await instance.start();
  console.log('====================================================');
  console.log('  PostgreSQL 16 Engine Active (User: postgres / Pass: postgres)  ');
  console.log('====================================================');

  // Keep process alive
  setInterval(() => {}, 100000);
}

startPostgres().catch(console.error);
