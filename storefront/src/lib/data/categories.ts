import { sdk } from '@lib/config'

export const listCategories = async function () {
  try {
    return await sdk.store.category
      .list({ fields: '+category_children' }, { next: { tags: ['categories'] } })
      .then(({ product_categories }) => product_categories)
  } catch (e) {
    return []
  }
}

export const getCategoriesList = async function (
  offset: number = 0,
  limit: number = 100
) {
  try {
    return await sdk.store.category.list(
      // TODO: Look into fixing the type
      // @ts-ignore
      { limit, offset },
      { next: { tags: ['categories'] } }
    )
  } catch (e) {
    return { product_categories: [], count: 0, offset: 0, limit: 100 }
  }
}

export const getCategoryByHandle = async function (categoryHandle: string[]) {
  try {
    return await sdk.store.category.list(
      // TODO: Look into fixing the type
      // @ts-ignore
      { handle: categoryHandle },
      { next: { tags: ['categories'] } }
    )
  } catch (e) {
    return { product_categories: [], count: 0, offset: 0, limit: 100 }
  }
}
