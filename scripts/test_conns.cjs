const { Client } = require('pg');

async function test() {
  const remote = new Client('postgresql://postgres:HjhOMsUcdgIJjKpvgAlgErvuzpnpSTyZ@tokaido.proxy.rlwy.net:12882/railway');
  try {
    await remote.connect();
    console.log('✅ Remote connected successfully!');
    const res = await remote.query('SELECT current_database(), current_user');
    console.log('Remote DB info:', res.rows);
    await remote.end();
  } catch (e) {
    console.error('❌ Remote error:', e.message);
  }
}

test();
