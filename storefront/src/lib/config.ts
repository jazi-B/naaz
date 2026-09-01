import Medusa from '@medusajs/js-sdk'

// Defaults to live Railway URL for production resilience
let MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'https://naaz-production.up.railway.app'

let PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_b09539d1f972deed11ed63fabef4c597d66bf2e909207b2bbd460d730db33fea'

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: PUBLISHABLE_KEY,
})
