import { HttpTypes } from '@medusajs/types'
import { SearchedProduct } from 'types/global'

import { getPercentageDiff } from './get-precentage-diff'
import { convertToLocale } from './money'

export const getPricesForVariant = (variant: any) => {
  if (!variant) {
    return null
  }

  const amount =
    variant?.calculated_price?.calculated_amount ??
    variant?.calculated_price?.amount ??
    variant?.prices?.[0]?.amount ??
    variant?.prices?.[0]?.raw_amount?.value ??
    0

  const currencyCode =
    variant?.calculated_price?.currency_code ??
    variant?.prices?.[0]?.currency_code ??
    'pkr'

  const originalAmount =
    variant?.calculated_price?.original_amount ??
    variant?.calculated_price?.amount ??
    amount

  return {
    calculated_price_number: Number(amount) || 0,
    calculated_price: convertToLocale({
      amount: Number(amount) || 0,
      currency_code: currencyCode,
    }),
    original_price_number: Number(originalAmount) || 0,
    original_price: convertToLocale({
      amount: Number(originalAmount) || 0,
      currency_code: currencyCode,
    }),
    currency_code: currencyCode,
    price_type: variant.calculated_price?.calculated_price?.price_list_type || 'default',
    percentage_diff: getPercentageDiff(
      Number(originalAmount) || 0,
      Number(amount) || 0
    ),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct | SearchedProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error('No product provided')
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const validVariants = product.variants.filter((v: any) => Boolean(v))
    if (!validVariants.length) return null

    const sorted = [...validVariants].sort((a: any, b: any) => {
      const priceA = a.calculated_price?.calculated_amount ?? a.prices?.[0]?.amount ?? 0
      const priceB = b.calculated_price?.calculated_amount ?? b.prices?.[0]?.amount ?? 0
      return priceA - priceB
    })

    return getPricesForVariant(sorted[0])
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
