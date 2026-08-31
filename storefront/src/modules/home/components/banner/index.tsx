import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner } from 'types/strapi'

export const Banner = ({ data }: { data: HeroBanner }) => {
  const { Image: bannerImage, CTA, Headline, Text: text } = data

  return (
    <Container className="my-8">
      <Box className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-amber-500/20 shadow-xl medium:h-[460px]">
        <Image
          src={bannerImage.url}
          alt={bannerImage.alternativeText ?? 'NAAZ Handbags'}
          fill
          className="object-cover object-center transition-transform duration-700 hover:scale-105"
        />

        {/* Dark Vignette Overlay for Crisp Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white small:p-10">
          <span className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            Artisan Handcrafted Quality
          </span>

          <Heading className="text-2xl font-extrabold tracking-tight text-white small:text-4xl medium:max-w-[700px]">
            {Headline}
          </Heading>

          <Text size="lg" className="mt-3 max-w-[620px] text-xs text-stone-200 small:text-sm medium:text-base">
            {text}
          </Text>

          <Button className="mt-6 rounded-xl bg-amber-500 px-8 py-3 font-bold text-black shadow-lg hover:bg-amber-400" asChild>
            <LocalizedClientLink href={CTA.BtnLink}>
              {CTA.BtnText} →
            </LocalizedClientLink>
          </Button>
        </div>
      </Box>
    </Container>
  )
}
