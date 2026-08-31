import { unstable_noStore as noStore } from 'next/cache'

import { sdk } from '@lib/config'
import { HttpTypes } from '@medusajs/types'
import { BACKEND_URL, PUBLISHABLE_API_KEY } from '@modules/search/actions'
import { ProductFilters } from 'types/global'

import { getRegion } from './regions'

export const getProductsById = async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products }) => products)
}

export const getProductByHandle = async function (
  handle: string,
  regionId?: string
) {
  try {
    const res = await sdk.store.product.list(
      {
        handle,
        ...(regionId ? { region_id: regionId } : {}),
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
      },
      { next: { tags: ['products'] } }
    )
    if (res?.products?.[0]) return res.products[0]

    // Fallback query without region_id
    const fallbackRes = await sdk.store.product.list(
      {
        handle,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
      },
      { next: { tags: ['products'] } }
    )
    return fallbackRes?.products?.[0] || null
  } catch (e) {
    console.error('getProductByHandle error:', e)
    try {
      const fallbackRes = await sdk.store.product.list(
        {
          handle,
          fields:
            '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
        },
        { next: { tags: ['products'] } }
      )
      return fallbackRes?.products?.[0] || null
    } catch (err) {
      return null
    }
  }
}

export const getProductsList = async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  noStore()

  const limit = queryParams?.limit || 12
  const offset = Math.max(0, (pageParam - 1) * limit)
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
  return sdk.store.product
    .list(
      {
        limit,
        offset,
        region_id: region.id,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
        ...queryParams,
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products, count }) => {
      const filteredProducts = products.filter((product) => {
        if (!product.variants || product.variants.length === 0) return false
        // If inventory is not managed, product is always available
        const v = product.variants[0] as any
        if (v.manage_inventory === false) return true
        if (typeof v.inventory_quantity === 'number') {
          return v.inventory_quantity > 0
        }
        return true
      })

      const filteredCount = filteredProducts.length
      const nextPage = filteredCount > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products: filteredProducts,
          count: count || filteredCount,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

export const getProductsListByCollectionId = async function ({
  collectionId,
  countryCode,
  excludeProductId,
  limit = 12,
  offset = 0,
}: {
  collectionId?: string | null
  countryCode: string
  excludeProductId?: string
  limit?: number
  offset?: number
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
}> {
  if (!collectionId) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  return sdk.store.product
    .list(
      {
        limit,
        offset,
        collection_id: [collectionId],
        region_id: region.id,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products, count }) => {
      if (excludeProductId) {
        products = products.filter((product) => product.id !== excludeProductId)
      }

      const nextPage = count > offset + limit ? offset + limit : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
      }
    })
}

export const getStoreFilters = async function () {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/filter-product-attributes`,
      {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
        },
      }
    )

    if (!res.ok) {
      return { collection: [], type: [], material: [], categories: [], colors: [], prices: [] }
    }

    const data = await res.json()
    return {
      collection: data.collection || [],
      type: data.type || [],
      material: data.material || [],
      categories: data.categories || [],
      colors: data.colors || [],
      prices: data.prices || []
    }
  } catch (e) {
    return { collection: [], type: [], material: [], categories: [], colors: [], prices: [] }
  }
}
