import { safeDecodeURIComponent } from '@lib/util/safe-decode-uri'
import { SearchedProducts } from 'types/global'

export const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
export const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const PRODUCT_LIMIT = 12

type SearchParams = {
  currency_code: string
  region_id: string
  page?: number
  order?: string
  category_id?: string
  collection?: string[]
  type?: string[]
  material?: string[]
  price?: string[]
  query?: string
}

export async function search({
  currency_code,
  region_id,
  page = 1,
  order = 'relevance',
  category_id,
  collection,
  type,
  material,
  price,
  query,
}: SearchParams): Promise<SearchedProducts> {
  const searchParams = new URLSearchParams({
    offset: ((page - 1) * PRODUCT_LIMIT).toString(),
    limit: PRODUCT_LIMIT.toString(),
    fields: '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
  })

  if (region_id) {
    searchParams.append('region_id', region_id)
  }

  if (order && order !== 'relevance') {
    const sortBy =
      order === 'price_asc'
        ? 'calculated_price'
        : order === 'price_desc'
          ? '-calculated_price'
          : order === 'created_at'
            ? '-created_at'
            : order
    searchParams.append('order', sortBy)
  }

  if (category_id) {
    if (category_id === 'pcat_shoulder_bags' || category_id === 'shoulder-bags') {
      searchParams.append('q', 'Shoulder')
    } else if (category_id === 'pcat_handbags' || category_id === 'handbags') {
      searchParams.append('q', 'Hand Bag')
    } else if (category_id === 'pcat_tote_bags' || category_id === 'tote-bags') {
      searchParams.append('q', 'Tote')
    } else if (category_id === 'pcat_crossbody_bags' || category_id === 'crossbody-bags') {
      searchParams.append('q', 'Cross Body')
    } else if (category_id === 'pcat_handbag_sets' || category_id === 'handbag-sets') {
      searchParams.append('q', 'Set')
    } else {
      searchParams.append('category_id[]', category_id)
    }
  }

  if (collection && Array.isArray(collection)) {
    collection.forEach((id) => {
      searchParams.append('collection_id[]', id)
    })
  }

  if (query) {
    searchParams.append('q', safeDecodeURIComponent(query))
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/store/products?${searchParams.toString()}`,
      {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY || 'pk_01HJ',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error('Store products query failed:', response.status, await response.text())
      return { results: [], count: 0 }
    }

    const data = await response.json()
    const prods = data.products || []

    return {
      results: prods,
      count: data.count || prods.length,
    }
  } catch (e) {
    console.error('Search error:', e)
    return { results: [], count: 0 }
  }
}
