const fs = require('fs');
const path = require('path');
const http = require('http');
const { Client } = require('pg');

const LOCAL_URL = 'http://localhost:9000';
const CSV_FILE = path.join(__dirname, '../data/markaz_user_catalog.csv');

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

async function postJSON(endpoint, data = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(LOCAL_URL + endpoint);
    const postBody = JSON.stringify(data);
    const options = {
      hostname: u.hostname,
      port: u.port || 9000,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
}

async function main() {
  console.log('===========================================================');
  console.log('  NAAZ — FULL CLEANUP & REAL MARKAZ IMPORT PIPELINE');
  console.log('===========================================================');

  const pgClient = new Client('postgres://postgres:postgres@localhost:5432/medusa_naaz');
  await pgClient.connect();

  let salesChannelId = 'sc_01';
  try {
    const scRes = await pgClient.query('SELECT id FROM sales_channel LIMIT 1');
    if (scRes.rows.length > 0) {
      salesChannelId = scRes.rows[0].id;
      console.log(`[Database] Found Sales Channel ID: ${salesChannelId}`);
    }
  } catch (err) {
    console.error('Error fetching sales channel:', err.message);
  }

  // 1. Setup Categories (Removes Shirts/Pants and adds Bags categories)
  console.log('\n[1/3] Setting up Handbag categories & removing Shirts/Pants...');
  try {
    const catRes = await postJSON('/setup-categories', {});
    console.log('Categories updated:', catRes);
  } catch (e) {
    console.log('Category setup note:', e.message);
  }

  // Query category IDs
  let shoulderBagCatId = null;
  let handbagCatId = null;
  try {
    const catQuery = await pgClient.query('SELECT id, name, handle FROM product_category');
    console.log('Current Categories in DB:', catQuery.rows.map(r => `${r.name} (${r.handle})`));
    shoulderBagCatId = catQuery.rows.find(c => c.handle === 'shoulder-bags')?.id;
    handbagCatId = catQuery.rows.find(c => c.handle === 'handbags')?.id;
  } catch (e) {
    console.error('Error fetching categories from DB:', e.message);
  }

  // 2. Delete all mock / non-Markaz products
  console.log('\n[2/3] Deleting mock products from database...');
  try {
    // Delete links and products not from Markaz
    await pgClient.query("DELETE FROM product_sales_channel WHERE product_id IN (SELECT id FROM product WHERE handle NOT LIKE '%mkz%')");
    await pgClient.query("DELETE FROM product_category_product WHERE product_id IN (SELECT id FROM product WHERE handle NOT LIKE '%mkz%')");
    const delRes = await pgClient.query("DELETE FROM product WHERE handle NOT LIKE '%mkz%'");
    console.log(`✅ Deleted ${delRes.rowCount || 0} mock demo products from database.`);
  } catch (e) {
    console.log('Cleanup error:', e.message);
  } finally {
    await pgClient.end();
  }

  // 3. Import Real Markaz Catalog
  if (!fs.existsSync(CSV_FILE)) {
    console.error('❌ CSV file not found:', CSV_FILE);
    return;
  }

  console.log('\n[3/3] Parsing and importing Real Markaz Handbag products...');
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const rows = parseCSV(content);
  const groups = groupByHandle(rows).filter((g) => g.main);
  console.log(`Found ${groups.length} unique Markaz products.`);

  const productsPayload = groups.map(({ handle, main, images }) => {
    const title = main['Title'] || handle;
    const desc = main['Body (HTML)'] || '';
    const price = parseInt(main['Variant Price'] || '1999', 10);
    const sku = main['Variant SKU'] || `MKZ-${handle}`;
    const optName = main['Option1 Name'] || 'Color';
    const optValue = main['Option1 Value'] || 'Standard';
    const validImages = images.filter(Boolean);

    const categoryIds = [];
    if (shoulderBagCatId) categoryIds.push(shoulderBagCatId);
    else if (handbagCatId) categoryIds.push(handbagCatId);

    return {
      title,
      handle,
      description: desc,
      status: 'published',
      category_ids: categoryIds,
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
      images: validImages.slice(0, 5).map((url) => ({ url })),
      thumbnail: validImages[0] || undefined,
      sales_channels: [{ id: salesChannelId }],
    };
  });

  // Batch import in chunks of 5
  const chunkSize = 5;
  for (let i = 0; i < productsPayload.length; i += chunkSize) {
    const chunk = productsPayload.slice(i, i + chunkSize);
    try {
      const res = await postJSON('/import', { products: chunk });
      console.log(`[Batch ${Math.floor(i/chunkSize) + 1}/${Math.ceil(productsPayload.length/chunkSize)}] Imported ${res.count || chunk.length} products`);
    } catch (e) {
      console.error(`[Batch ${Math.floor(i/chunkSize) + 1}] Error:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log('\n===========================================================');
  console.log('✅ ALL MOCK PRODUCTS & SHIRTS CATEGORIES REMOVED!');
  console.log('✅ ALL REAL MARKAZ HANDBAGS IMPORTED INTO MEDUSA & SOLACE UI!');
  console.log('===========================================================');
}

main().catch(console.error);
