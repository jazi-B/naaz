const { Client } = require('pg');

async function setupDeliveryAndPayment() {
  const client = new Client('postgres://postgres:postgres@localhost:5432/medusa_naaz');
  await client.connect();

  console.log('--- 1. Adding Pakistan (pk) to Fulfillment Geo Zone ---');
  const serviceZone = await client.query('SELECT id FROM service_zone LIMIT 1');
  const szId = serviceZone.rows[0]?.id;

  if (szId) {
    const checkGz = await client.query("SELECT id FROM geo_zone WHERE country_code = 'pk'");
    if (checkGz.rows.length === 0) {
      await client.query(`
        INSERT INTO geo_zone (id, type, country_code, service_zone_id, created_at, updated_at)
        VALUES ('fgz_pk_pakistan_nationwide', 'country', 'pk', $1, NOW(), NOW())
      `, [szId]);
      console.log(`✅ Added pk country to service zone: ${szId}`);
    } else {
      console.log('pk country already in geo_zone.');
    }
  }

  console.log('--- 2. Setting PKR Shipping Option Prices ---');
  const standardPriceSet = 'pset_01M1D0NNCHTW8KZ5D43AJQKWEP';
  const expressPriceSet = 'pset_01M1D0NNCMG1HYJFQD9860ETDF';

  const raw200 = JSON.stringify({ value: '200', precision: 20 });
  const raw350 = JSON.stringify({ value: '350', precision: 20 });

  // Standard COD Delivery: Rs. 200
  const chkStd = await client.query("SELECT id FROM price WHERE id = 'pr_so_std_pkr'");
  if (chkStd.rows.length === 0) {
    await client.query(`
      INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, min_quantity, max_quantity, created_at, updated_at)
      VALUES ('pr_so_std_pkr', $1, 'pkr', 200, $2::jsonb, 1, null, NOW(), NOW())
    `, [standardPriceSet, raw200]);
  }

  // Express Delivery: Rs. 350
  const chkExp = await client.query("SELECT id FROM price WHERE id = 'pr_so_exp_pkr'");
  if (chkExp.rows.length === 0) {
    await client.query(`
      INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, min_quantity, max_quantity, created_at, updated_at)
      VALUES ('pr_so_exp_pkr', $1, 'pkr', 350, $2::jsonb, 1, null, NOW(), NOW())
    `, [expressPriceSet, raw350]);
  }

  console.log('✅ Added PKR prices (Rs. 200 & Rs. 350) for Shipping Options');

  console.log('--- 3. Linking Payment Providers to All Regions ---');
  const regions = await client.query('SELECT id, name FROM region');
  for (const r of regions.rows) {
    const chkLink = await client.query("SELECT id FROM region_payment_provider WHERE region_id = $1 AND payment_provider_id = 'pp_system_default'", [r.id]);
    if (chkLink.rows.length === 0) {
      const linkId = `regpp_${r.id.slice(-8)}_pp_sys`;
      await client.query(`
        INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at)
        VALUES ($1, $2, 'pp_system_default', NOW(), NOW())
      `, [linkId, r.id]);
      console.log(`✅ Linked pp_system_default to Region: ${r.name} (${r.id})`);
    } else {
      console.log(`Region ${r.name} already linked to pp_system_default`);
    }
  }

  // Update shipping option titles
  await client.query(`
    UPDATE shipping_option 
    SET name = 'Standard Nationwide Delivery (Cash on Delivery)'
    WHERE id = 'so_01M1D0NN9ZBSHDFST8DVX0WQH7'
  `);
  await client.query(`
    UPDATE shipping_option 
    SET name = 'Express Courier Delivery (TCS / Leopards)'
    WHERE id = 'so_01M1D0NNA20GBSKEMNSN1P3TCC'
  `);
  console.log('✅ Updated Shipping Option Labels to Pakistani Courier Standards');

  await client.end();
  console.log('===========================================================');
  console.log('🎉 DELIVERY (SHIPPING) & PAYMENT ARE NOW FULLY ACTIVE!');
  console.log('===========================================================');
}

setupDeliveryAndPayment().catch(console.error);
