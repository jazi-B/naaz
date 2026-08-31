import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('  REMOVING MOCK PRODUCTS — RETAINING ONLY REAL MARKAZ STOCK ');
console.log('====================================================');

const dbPath = path.join(process.cwd(), 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const initialCount = db.products.length;

// Keep only real Markaz products with valid MKZ supplier SKUs
db.products = db.products.filter(p => {
  const isReal = p.supplier_sku && p.supplier_sku.startsWith('MKZ-') && !p.supplier_sku.includes('TEST') && !p.supplier_sku.includes('CSV');
  return isReal;
});

const cleanCount = db.products.length;
const removedCount = initialCount - cleanCount;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ Mock Products Removed: ${removedCount}`);
console.log(`✅ Pure Real Markaz Products Remaining: ${cleanCount}`);
console.log('====================================================');
