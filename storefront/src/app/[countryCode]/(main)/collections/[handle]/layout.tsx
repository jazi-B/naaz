import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  getCollectionByHandle,
  getCollectionsList,
} from '@lib/data/collections'
import { listRegions } from '@lib/data/regions'
import { StoreCollection, StoreRegion } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

interface CollectionPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string; countryCode: string }>
}



export async function generateMetadata(
  props: CollectionPageLayoutProps
): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | NAAZ Luxury Handbags (ناز)`,
    description: `${collection.title} collection — NAAZ Women's Handbags Pakistan`,
  } as Metadata

  return metadata
}

export default async function CollectionPageLayout(
  props: CollectionPageLayoutProps
) {
  const params = await props.params

  const { handle } = params

  const { children } = props

  const currentCollection = await getCollectionByHandle(handle).then(
    (collection: StoreCollection) => collection
  )

  return (
    <>
      <Container className="flex flex-col gap-8 !py-8">
        <Box className="flex flex-col gap-4">
          <StoreBreadcrumbs breadcrumb={currentCollection.title} />
          <Heading
            as="h1"
            className="text-4xl text-basic-primary small:text-5xl"
          >
            {currentCollection.title}
          </Heading>
        </Box>
      </Container>
      {children}
    </>
  )
}
