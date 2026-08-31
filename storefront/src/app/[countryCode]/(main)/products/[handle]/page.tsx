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

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then(
      (regions) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )

    if (!countryCodes) {
      return []
    }

    const products = await Promise.all(
      countryCodes.map((countryCode) => {
        return getProductsList({ countryCode })
      })
    ).then((responses) =>
      responses.map(({ response }) => response.products).flat()
    )

    const staticParams = countryCodes
      ?.map((countryCode) =>
        products.map((product) => ({
          countryCode,
          handle: product.handle,
        }))
      )
      .flat()

    return staticParams
  } catch (error) {
    console.error('Skipping static generation:', error)
    return []
  }
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
