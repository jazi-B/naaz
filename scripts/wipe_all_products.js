import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('  WIPING ALL CATALOG STOCK — RESETTING TO EMPTY DB  ');
console.log('====================================================');

const dbPath = path.join(process.cwd(), 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const countBefore = db.products.length;
db.products = [];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ Cleared ${countBefore} products from database!`);
console.log(`✅ Total Products Remaining: 0`);
console.log('====================================================');
