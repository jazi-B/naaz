/**
 * NAAZ — Markaz CSV → Medusa Importer
 * Usage: node scripts/import-markaz-to-medusa.js <path-to-csv>
 * Example: node scripts/import-markaz-to-medusa.js markaz-products.csv
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// ── CONFIG ────────────────────────────────────────────────────────────────────
const MEDUSA_URL    = 'http://localhost:9000';
const SECRET_KEY    = 'sk_9530b53f8d9e69f9af52ec86ac2112181f7a21adcd84015bc1cad35b61075dd3';
const SALES_CH_ID   = 'sc_01M19SW22J8CRBSXTJXN7NEDXN'; // default sales channel
const CSV_FILE      = process.argv[2] || path.join(__dirname, '../markaz-products.csv');
// ─────────────────────────────────────────────────────────────────────────────

async function apiCall(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(MEDUSA_URL + endpoint);
    const data = body ? JSON.stringify(body) : null;
    // Secret key uses HTTP Basic Auth: base64(sk_...:)
    const basicAuth = Buffer.from(SECRET_KEY + ':').toString('base64');
    const options = {
      hostname: url.hostname,
      port: url.port || 9000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Parse CSV (handles quoted fields with commas inside)
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
    return obj;
  });
}

function parseRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// Group CSV rows by Handle
function groupByHandle(rows) {
  const map = {};
  const order = [];
  for (const row of rows) {
    const handle = row['Handle'];
    if (!handle) continue;
    if (!map[handle]) {
      map[handle] = { main: null, images: [] };
      order.push(handle);
    }
    if (row['Title']) map[handle].main = row;
    if (row['Image Src']) map[handle].images.push(row['Image Src']);
  }
  return order.map((h) => ({ handle: h, ...map[h] }));
}

async function main() {
  if (!fs.existsSync(CSV_FILE)) {
    console.error('CSV file not found: ' + CSV_FILE);
    console.log('Usage: node scripts/import-markaz-to-medusa.js <path-to-csv>');
    process.exit(1);
  }
  console.log('Reading: ' + CSV_FILE);
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const rows    = parseCSV(content);
  const groups  = groupByHandle(rows).filter((g) => g.main);
  console.log('Found ' + groups.length + ' products to import\n');

  console.log('Using Secret API Key for authentication...');

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < groups.length; i++) {
    const { handle, main, images } = groups[i];
    const title    = main['Title'];
    const desc     = main['Body (HTML)'] || '';
    const tags     = (main['Tags'] || '').split(',').map((t) => t.trim()).filter(Boolean);
    const price    = parseInt(main['Variant Price'] || '0', 10);
    const sku      = main['Variant SKU'] || '';
    const optName  = main['Option1 Name'] || 'Color';
    const optValue = main['Option1 Value'] || 'Default';
    const imgUrl   = images[0] || '';

    const productPayload = {
      title,
      handle,
      description: desc,
      status: 'published',
      options: [{ title: optName, values: [optValue] }],
      variants: [
        {
          title: optValue,
          sku,
          prices: [{ currency_code: 'pkr', amount: price }],
          options: { [optName]: optValue },
          manage_inventory: false,
        },
      ],
      images: images.slice(0, 5).map((url) => ({ url })),
      thumbnail: imgUrl || undefined,
      sales_channels: [{ id: SALES_CH_ID }],
    };

    try {
      const res = await apiCall('POST', '/admin/products', productPayload);
      if (res.product) {
        success++;
        console.log('[' + (i+1) + '/' + groups.length + '] OK: ' + title);
      } else {
        failed++;
        console.log('[' + (i+1) + '/' + groups.length + '] FAIL: ' + title + ' — ' + JSON.stringify(res).slice(0, 120));
      }
    } catch (err) {
      failed++;
      console.log('[' + (i+1) + '/' + groups.length + '] ERROR: ' + title + ' — ' + err.message);
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log('\n--- DONE ---');
  console.log('Imported: ' + success + ' products');
  console.log('Failed:   ' + failed + ' products');
  console.log('Check: http://localhost:9000/app/products');
}

main().catch(console.error);
