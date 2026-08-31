export default function medusaError(error: any): any {
  console.warn('Medusa API Warning:', error?.message || error)
  return null
}
