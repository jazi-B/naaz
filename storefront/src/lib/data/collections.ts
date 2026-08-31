import { cache } from 'react'

import { sdk } from '@lib/config'
import { HttpTypes } from '@medusajs/types'

import { getProductsList } from './products'

export const retrieveCollection = cache(async function (id: string) {
  try {
    return await sdk.store.collection
      .retrieve(id, {}, { next: { tags: ['collections'] } })
      .then(({ collection }) => collection)
  } catch (e) {
    return null
  }
})

export const getCollectionsList = cache(async function (
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  try {
    return await sdk.store.collection
      .list({ limit, offset: 0 }, { next: { tags: ['collections'] } })
      .then(({ collections }) => ({ collections, count: collections.length }))
  } catch (e) {
    return { collections: [], count: 0 }
  }
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection | null> {
  try {
    return await sdk.store.collection
      .list({ handle }, { next: { tags: ['collections'] } })
      .then(({ collections }) => collections[0])
  } catch (e) {
    return null
  }
})

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    try {
      const { collections } = await getCollectionsList(3)

      if (!collections || !collections.length) {
        return []
      }

      const collectionIds = collections
        .map((collection) => collection.id)
        .filter(Boolean)

      const { response } = await getProductsList({
        queryParams: { collection_id: collectionIds } as any,
        countryCode,
      })

      response.products?.forEach((product) => {
        const collection = collections.find(
          (collection) => collection.id === product.collection_id
        )

        if (collection) {
          if (!collection.products) {
            collection.products = []
          }

          collection.products.push(product as any)
        }
      })

      return collections as unknown as HttpTypes.StoreCollection[]
    } catch (e) {
      return []
    }
  }
)
