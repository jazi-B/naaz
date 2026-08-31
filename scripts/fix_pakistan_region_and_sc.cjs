const { Client } = require('pg');

async function fixPakistanAndChannels() {
  const client = new Client('postgres://postgres:postgres@localhost:5432/medusa_naaz');
  await client.connect();

  console.log('--- 1. Setting up Pakistan Region ---');
  // Check or create Pakistan region
  const regCheck = await client.query("SELECT id FROM region WHERE currency_code = 'pkr' OR name = 'Pakistan'");
  let pakistanRegionId;

  if (regCheck.rows.length > 0) {
    pakistanRegionId = regCheck.rows[0].id;
    console.log('Existing Pakistan region ID:', pakistanRegionId);
  } else {
    pakistanRegionId = 'reg_01NAAZPAKISTAN000000000000';
    await client.query(`
      INSERT INTO region (id, name, currency_code, created_at, updated_at)
      VALUES ($1, 'Pakistan', 'pkr', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [pakistanRegionId]);
    console.log('Created Pakistan Region with ID:', pakistanRegionId);
  }

  // Link pk country to Pakistan region
  await client.query(`
    UPDATE region_country SET region_id = $1 WHERE iso_2 IN ('pk', 'us', 'gb', 'ae')
  `, [pakistanRegionId]);
  console.log('Assigned pk, us, gb, ae to Pakistan Region');

  // Ensure PKR currency is enabled in store
  const storeRes = await client.query('SELECT id FROM store LIMIT 1');
  if (storeRes.rows.length > 0) {
    const storeId = storeRes.rows[0].id;
    await client.query(`
      INSERT INTO store_currency (id, store_id, currency_code, is_default, created_at, updated_at)
      VALUES ('scurr_pkr_' || $1, $1, 'pkr', true, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, [storeId]);
    console.log('Store default currency set to PKR');
  }

  console.log('--- 2. Linking All Products to All Sales Channels ---');
  const salesChannels = await client.query('SELECT id FROM sales_channel');
  const products = await client.query('SELECT id FROM product');

  for (const sc of salesChannels.rows) {
    for (const prod of products.rows) {
      const linkId = `psc_${sc.id.slice(-8)}_${prod.id.slice(-8)}`;
      await client.query(`
        INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [linkId, prod.id, sc.id]);
    }
  }
  console.log(`Linked ${products.rows.length} products to ${salesChannels.rows.length} sales channels.`);

  console.log('--- 3. Verifying Prices for PKR & Region ---');
  const variants = await client.query('SELECT id, product_id FROM product_variant');
  console.log(`Total Variants: ${variants.rows.length}`);

  for (const v of variants.rows) {
    const psLink = await client.query('SELECT price_set_id FROM product_variant_price_set WHERE variant_id = $1', [v.id]);
    let priceSetId;
    if (psLink.rows.length > 0) {
      priceSetId = psLink.rows[0].price_set_id;
    } else {
      priceSetId = `pset_${v.id.slice(-16)}`;
      await client.query(`
        INSERT INTO price_set (id, created_at, updated_at)
        VALUES ($1, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [priceSetId]);

      await client.query(`
        INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
        VALUES ('pvps_' || $1, $1, $2, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [v.id, priceSetId]);
    }

    const priceId = `pr_${v.id.slice(-16)}_pkr`;
    const rawAmt = JSON.stringify({ value: '1999', precision: 20 });
    await client.query(`
      INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, min_quantity, max_quantity, created_at, updated_at)
      VALUES ($1, $2, 'pkr', 1999, $3::jsonb, 1, null, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [priceId, priceSetId, rawAmt]);
  }
  console.log('Verified price sets & PKR prices for all variants.');

  await client.end();
  console.log('✅ Pakistan region & sales channel sync complete!');
}

fixPakistanAndChannels().catch(console.error);
