import Medusa from '@medusajs/js-sdk'

// Defaults to live Railway URL for production resilience
let MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  'https://naaz-production.up.railway.app'

let PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_40e4b9f7ad7abd6f250951736bc5f717c400178f35f63bd3047f94711ff7cc02'

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: PUBLISHABLE_KEY,
})
