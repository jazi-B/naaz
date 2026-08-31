import fs from 'fs';
import path from 'path';
import { importMarkazCSV } from '../services/markazSyncService.js';

console.log('====================================================');
console.log('  IMPORTING REAL MARKAZ STOCK CSV INTO NAAZ CATALOG ');
console.log('====================================================');

const csvPath = path.join(process.cwd(), 'data', 'markaz_user_catalog.csv');
const csvText = fs.readFileSync(csvPath, 'utf8');

// Execute import with autoPublish: true to make items immediately live on storefront
const result = importMarkazCSV(csvText, { autoPublish: true }, 'official_markaz_stock.csv');

console.log(`✅ CSV Import Completed Successfully!`);
console.log(`   Processed Rows:  ${result.record.processed_count}`);
console.log(`   Products Created: ${result.record.created_count}`);
console.log(`   Products Updated: ${result.record.updated_count}`);
console.log(`   Errors Encountered: ${result.record.errors_count}`);
console.log(`   Total Catalog Products: ${result.totalProducts}`);
console.log('====================================================');
