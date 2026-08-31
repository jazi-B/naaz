/**
 * NAAZ — Admin Courier Tracking Tool
 * Usage: node scripts/assign_courier_tracking.cjs <order-id-or-display-id> <courier-name> <tracking-number>
 * Example: node scripts/assign_courier_tracking.cjs 1 TCS TCS-998234123
 */

const { Client } = require('pg');

const COURIER_LINKS = {
  tcs: (tn) => `https://www.tcsexpress.com/tracking?track_number=${encodeURIComponent(tn)}`,
  leopard: (tn) => `https://leopardscourier.com/tracking/${encodeURIComponent(tn)}`,
  leopards: (tn) => `https://leopardscourier.com/tracking/${encodeURIComponent(tn)}`,
  trax: (tn) => `https://sonic.trax.pk/tracking?tracking_number=${encodeURIComponent(tn)}`,
  postex: (tn) => `https://postex.pk/tracking?cn=${encodeURIComponent(tn)}`,
  callcourier: (tn) => `https://callcourier.com.pk/tracking/?tracking=${encodeURIComponent(tn)}`,
  mnp: (tn) => `https://www.mulphilog.com/tracking?consignment=${encodeURIComponent(tn)}`,
};

async function main() {
  const orderId = process.argv[2] || '1';
  const courier = process.argv[3] || 'TCS';
  const trackingNumber = process.argv[4] || `TCS-${Date.now().toString().slice(-8)}`;

  const courierLower = courier.toLowerCase();
  const trackingGenerator = COURIER_LINKS[courierLower] || COURIER_LINKS.tcs;
  const trackingUrl = trackingGenerator(trackingNumber);

  const client = new Client('postgres://postgres:postgres@localhost:5432/medusa_naaz');
  await client.connect();

  const check = await client.query(
    'SELECT id, display_id, email, status FROM "order" WHERE id = $1 OR display_id::text = $1',
    [orderId]
  );

  if (check.rows.length === 0) {
    console.error(`❌ Order #${orderId} not found in database!`);
    await client.end();
    return;
  }

  const ord = check.rows[0];

  const metaPayload = {
    courier: courier.toUpperCase(),
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
    shipped_at: new Date().toISOString(),
  };

  await client.query(
    `UPDATE "order"
     SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{tracking_info}', $1::jsonb),
         status = 'completed',
         updated_at = NOW()
     WHERE id = $2`,
    [JSON.stringify(metaPayload), ord.id]
  );

  console.log('===========================================================');
  console.log(`✅ Courier Tracking Assigned for Order #${ord.display_id} (${ord.email})`);
  console.log(`🚚 Courier Partner: ${courier.toUpperCase()}`);
  console.log(`📍 Tracking Number: ${trackingNumber}`);
  console.log(`🔗 Live Tracking URL: ${trackingUrl}`);
  console.log('===========================================================');
  console.log(`Customer can now track live at: http://localhost:3001/pk/track-order?q=${ord.display_id}`);

  await client.end();
}

main().catch(console.error);
