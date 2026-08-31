import fs from 'fs';
import path from 'path';

async function testImport() {
  const csvPath = path.join(process.cwd(), 'data', 'markaz_user_catalog.csv');
  const csvText = fs.readFileSync(csvPath, 'utf8');

  try {
    const res = await fetch('http://localhost:8000/api/admin/markaz/import-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText, filename: 'markaz-shopify-2026-08-28.csv' })
    });
    console.log('STATUS:', res.status, res.statusText);
    const text = await res.text();
    console.log('RESPONSE:', text.substring(0, 500));
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}

testImport();
