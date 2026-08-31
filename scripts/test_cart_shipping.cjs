const http = require('http');

const PUBLISHABLE_KEY = 'pk_b09539d1f972deed11ed63fabef4c597d66bf2e909207b2bbd460d730db33fea';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 9000,
      path,
      method,
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch { resolve(b); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  console.log('--- 1. Creating Cart with Pakistan Region ---');
  const cartRes = await request('/store/carts', 'POST', {
    region_id: 'reg_01NAAZPAKISTAN000000000000',
    shipping_address: {
      first_name: 'Muhammad',
      last_name: 'Jazib',
      address_1: 'Milat Town',
      city: 'Faisalabad',
      country_code: 'pk',
      phone: '03047437611'
    }
  });

  const cartId = cartRes?.cart?.id;
  console.log('Cart Created:', cartId);

  if (cartId) {
    console.log('--- 2. Fetching Shipping Options for Cart ---');
    const soRes = await request(`/store/shipping-options?cart_id=${cartId}`);
    console.log('Available Shipping Options:', soRes.shipping_options?.map(s => ({
      id: s.id,
      name: s.name,
      amount: s.amount,
      price_type: s.price_type
    })));

    console.log('--- 3. Fetching Payment Providers for Region ---');
    const ppRes = await request(`/store/payment-providers?region_id=reg_01NAAZPAKISTAN000000000000`);
    console.log('Payment Providers:', ppRes);
  }
}

test().catch(console.error);
