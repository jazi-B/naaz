import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('====================================================');
console.log('  ANALYZING PRODUCT IMAGE URLS IN DB ');
console.log('====================================================');

let svgTemplateCount = 0;
let externalUrlCount = 0;
let invalidImageCount = 0;

db.products.forEach(p => {
  if (!p.image || p.image === 'images/handbags/shoulder_bag.svg') {
    svgTemplateCount++;
  } else if (p.image.startsWith('http')) {
    externalUrlCount++;
  } else {
    invalidImageCount++;
  }
});

console.log(`Total Products: ${db.products.length}`);
console.log(`Products using Markaz External Image URLs (https://...): ${externalUrlCount}`);
console.log(`Products falling back to SVG Template: ${svgTemplateCount}`);
console.log(`Products with Invalid/Missing Image: ${invalidImageCount}`);
console.log('====================================================');

// Print first 5 sample products and their image URLs
console.log('\nSample Product Images:');
db.products.slice(0, 10).forEach(p => {
  console.log(`ID ${p.id}: [${p.name}] -> Image: ${p.image.substring(0, 80)}`);
});
