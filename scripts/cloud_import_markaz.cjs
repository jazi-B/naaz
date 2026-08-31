const fs = require('fs');
const path = require('path');
const https = require('https');

const RAILWAY_URL = 'https://medusa-backend-production-94ae.up.railway.app';
const SALES_CH_ID = 'sc_01M1BBBSMR276BA3WQ1W0GRP70';
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

async function postJSON(endpoint, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(RAILWAY_URL + endpoint);
    const postBody = JSON.stringify(data);
    const options = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody),
      },
    };

    const req = https.request(options, (res) => {
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
  if (!fs.existsSync(CSV_FILE)) {
    console.error('File not found:', CSV_FILE);
    return;
  }

  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const rows = parseCSV(content);
  const groups = groupByHandle(rows).filter((g) => g.main);
  console.log(`Parsed ${groups.length} unique products from Markaz CSV`);

  const productsPayload = groups.map(({ handle, main, images }) => {
    const title = main['Title'] || handle;
    const desc = main['Body (HTML)'] || '';
    const price = parseInt(main['Variant Price'] || '0', 10);
    const sku = main['Variant SKU'] || `SKU-${handle}`;
    const optName = main['Option1 Name'] || 'Color';
    const optValue = main['Option1 Value'] || 'Default';
    const validImages = images.filter(Boolean);

    return {
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
      images: validImages.slice(0, 5).map((url) => ({ url })),
      thumbnail: validImages[0] || undefined,
      sales_channels: [{ id: SALES_CH_ID }],
    };
  });

  console.log(`Sending ${productsPayload.length} products to Railway Cloud Medusa...`);

  // Batch in chunks of 5
  const chunkSize = 5;
  for (let i = 0; i < productsPayload.length; i += chunkSize) {
    const chunk = productsPayload.slice(i, i + chunkSize);
    try {
      const res = await postJSON('/import', { products: chunk });
      console.log(`[Batch ${Math.floor(i/chunkSize) + 1}/${Math.ceil(productsPayload.length/chunkSize)}] Result:`, res);
    } catch (e) {
      console.error(`[Batch ${Math.floor(i/chunkSize) + 1}] Error:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\n✅ All Markaz products import completed!');
}

main().catch(console.error);
