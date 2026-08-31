import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getProductByHandle, getProductsList } from '@lib/data/products'
import { getRegion, listRegions } from '@lib/data/regions'
import ProductTemplate from '@modules/products/templates'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}



export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  const product = await getProductByHandle(handle, region?.id)

  if (!product) {
    return {
      title: 'Product | Naaz Store',
    }
  }

  return {
    title: `${product.title} | Naaz Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Naaz Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  const pricedProduct = await getProductByHandle(params.handle, region?.id)

  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  )
}
