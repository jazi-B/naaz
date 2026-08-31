const fs = require('fs');
const path = require('path');
const https = require('https');

const csvPath = path.join(__dirname, '../data/markaz_user_catalog.csv');
const content = fs.readFileSync(csvPath, 'utf8');

const urls = Array.from(new Set(content.match(/https:\/\/www\.markaz\.app\/api\/export\/image\/[^\s",]+/g) || []));
console.log(`Found ${urls.length} distinct image URLs in CSV.`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 500 }));
  });
}

async function testAll() {
  const working = [];
  const broken = [];

  for (let i = 0; i < Math.min(urls.length, 25); i++) {
    const res = await checkUrl(urls[i]);
    if (res.status === 200) {
      working.push(res.url);
    } else {
      broken.push(res.url);
    }
  }

  console.log(`✅ Working URLs (${working.length}):`);
  working.slice(0, 8).forEach(u => console.log(' - ' + u));
  console.log(`❌ Broken URLs (${broken.length}):`);
  broken.forEach(u => console.log(' - ' + u));
}

testAll().catch(console.error);
