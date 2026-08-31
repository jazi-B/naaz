import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('====================================================');
console.log('  ASSIGNING SMART CATEGORY GRAPHICS TO MISSING IMAGES ');
console.log('====================================================');

const categoryImageMap = {
  'Shoulder Bags': 'images/handbags/shoulder_bag.svg',
  'Hand Bags': 'images/handbags/tote_bag.svg',
  'Crossbody Bags': 'images/handbags/crossbody_bag.svg',
  'Clutches': 'images/handbags/crescent_bag.svg',
  'Purse': 'images/handbags/crossbody_bag.svg',
  'Pouches': 'images/handbags/mini_bag.svg'
};

let updatedCount = 0;

db.products.forEach(p => {
  if (!p.image || p.image === 'images/handbags/shoulder_bag.svg' || !p.image.startsWith('http')) {
    const matchedGraphic = categoryImageMap[p.category_name] || 'images/handbags/shoulder_bag.svg';
    p.image = matchedGraphic;
    updatedCount++;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ ${updatedCount} products updated with category-matched luxury handbag vector graphics.`);
console.log('====================================================');
