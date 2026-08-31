import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner } from 'types/strapi'

const Hero = ({ data }: { data: HeroBanner }) => {
  const { Headline, Text: text, CTA, Image: bannerImage } = data

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary via-primary to-basic-primary/5">
      <div className="mx-auto max-w-[1440px] px-4 py-4 small:px-8 small:py-8 medium:px-14">
        {/* Luxury Banner Image with rounded elegance */}
        <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-amber-500/20 shadow-2xl small:h-[420px] medium:h-[500px]">
          <Image
            src={bannerImage.url}
            alt={bannerImage.alternativeText ?? 'NAAZ Luxury Handbags'}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            width={1600}
            height={900}
            priority
          />
          {/* Subtle luxury vignette overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Quick floating luxury badge on bottom left of image */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold tracking-wider text-amber-300 backdrop-blur-md small:bottom-6 small:left-6 small:text-sm">
            <span>✨</span>
            <span>NAAZ LUXURY EDITION (ناز)</span>
          </div>
        </div>

        {/* Content & Action Bar */}
        <div className="mt-8 flex flex-col justify-between gap-6 medium:flex-row medium:items-end">
          <div className="max-w-[650px]">
            <div className="mb-2 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Pakistan's Premier Handbag Collection
            </div>
            <Heading className="text-3xl font-extrabold tracking-tight text-basic-primary small:text-4xl medium:text-5xl">
              {Headline}
            </Heading>
          </div>

          <div className="flex flex-col items-start gap-4 medium:items-end">
            <Text
              size="lg"
              className="max-w-[440px] text-sm text-basic-primary/80 small:text-base medium:text-end"
            >
              {text}
            </Text>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-xl px-7 py-3 text-base font-bold shadow-lg shadow-amber-500/20">
                <LocalizedClientLink href={CTA.BtnLink}>
                  {CTA.BtnText} →
                </LocalizedClientLink>
              </Button>
              <Button variant="tonal" asChild className="rounded-xl px-5 py-3 text-base">
                <LocalizedClientLink href="/categories/shoulder-bags">
                  Explore Bags
                </LocalizedClientLink>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Highlight Strip */}
        <div className="mt-8 grid grid-cols-1 gap-3 rounded-xl border border-basic-primary/10 bg-basic-primary/5 p-4 small:grid-cols-3 small:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-xs font-bold text-basic-primary">Free Delivery</p>
              <p className="text-[11px] text-basic-primary/60">On all orders over Rs. 3,999</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <p className="text-xs font-bold text-basic-primary">100% Cash on Delivery</p>
              <p className="text-[11px] text-basic-primary/60">Pay when you receive at doorstep</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-xs font-bold text-basic-primary">Premium Quality Assured</p>
              <p className="text-[11px] text-basic-primary/60">Verified Markaz verified catalog</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
