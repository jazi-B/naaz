import Image from 'next/image'

import { Container } from '@modules/common/components/container'
import { SolaceLogoBig } from '@modules/common/icons/logo-solace-big'
import { StrapiPhotoAttributes } from 'types/strapi'

export const Banner = ({ data }: { data: StrapiPhotoAttributes[] }) => {
  const mainImage = data?.[0]?.url
  const logoImage = data?.[1]?.url

  return (
    <Container className="flex flex-col gap-6 text-basic-primary small:gap-12">
      {mainImage && (
        <Image
          src={mainImage}
          alt={data[0]?.alternativeText ?? `Banner image`}
          height={300}
          width={1400}
          className="h-[208px] w-full object-cover large:h-[288px]"
        />
      )}
      {logoImage ? (
        <Image
          src={logoImage}
          alt={data[1]?.alternativeText ?? `Banner logo`}
          height={208}
          width={1400}
          className="h-auto w-full dark:invert"
        />
      ) : (
        <SolaceLogoBig className="h-auto w-full" />
      )}
    </Container>
  )
}
