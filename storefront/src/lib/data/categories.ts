import { sdk } from '@lib/config'

export const HANDBAG_CATEGORIES = [
  {
    id: 'pcat_shoulder_bags',
    name: 'Shoulder Bags',
    handle: 'shoulder-bags',
    description: 'Elegant leather and printed shoulder bags for everyday style.',
    category_children: [],
  },
  {
    id: 'pcat_handbags',
    name: 'Handbags',
    handle: 'handbags',
    description: 'Premium handcrafted women handbags.',
    category_children: [],
  },
  {
    id: 'pcat_tote_bags',
    name: 'Tote Bags',
    handle: 'tote-bags',
    description: 'Spacious and durable tote bags for work and travel.',
    category_children: [],
  },
  {
    id: 'pcat_crossbody_bags',
    name: 'Crossbody Bags',
    handle: 'crossbody-bags',
    description: 'Trendy crossbody bags with digital & chain straps.',
    category_children: [],
  },
  {
    id: 'pcat_handbag_sets',
    name: 'Handbag Sets',
    handle: 'handbag-sets',
    description: 'Luxury 3-piece and 5-piece handbag & wallet sets.',
    category_children: [],
  },
]

export const listCategories = async function () {
  try {
    const raw = await sdk.store.category
      .list({ fields: '+category_children' }, { next: { tags: ['categories'] } })
      .then(({ product_categories }) => product_categories)

    const filtered = (raw || []).filter(
      (c) =>
        !['shirts', 'sweatshirts', 'pants', 'merch', 'clothing'].includes(
          c.handle?.toLowerCase()
        )
    )

    if (filtered.length > 0) return filtered
    return HANDBAG_CATEGORIES as any
  } catch (e) {
    return HANDBAG_CATEGORIES as any
  }
}

export const getCategoriesList = async function (
  offset: number = 0,
  limit: number = 100
) {
  try {
    const categories = await listCategories()
    return {
      product_categories: categories.slice(offset, offset + limit),
      count: categories.length,
      offset,
      limit,
    }
  } catch (e) {
    return {
      product_categories: HANDBAG_CATEGORIES as any,
      count: HANDBAG_CATEGORIES.length,
      offset: 0,
      limit: 100,
    }
  }
}

export const getCategoryByHandle = async function (categoryHandle: string[]) {
  try {
    const handleStr = Array.isArray(categoryHandle)
      ? categoryHandle[categoryHandle.length - 1]
      : categoryHandle
    const categories = await listCategories()
    const match =
      categories.find((c: any) => c.handle === handleStr) ||
      HANDBAG_CATEGORIES.find((c) => c.handle === handleStr) ||
      HANDBAG_CATEGORIES[0]

    return {
      product_categories: [match],
      count: 1,
      offset: 0,
      limit: 100,
    }
  } catch (e) {
    return {
      product_categories: [HANDBAG_CATEGORIES[0] as any],
      count: 1,
      offset: 0,
      limit: 100,
    }
  }
}
