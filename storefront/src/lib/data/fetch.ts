import {
  AboutUsData,
  BlogData,
  BlogPost,
  CollectionsData,
  ContentPageData,
  FAQData,
  HeroBannerData,
  MidBannerData,
  VariantColorData,
} from 'types/strapi'

export const fetchStrapiClient = async (
  endpoint: string,
  params?: RequestInit
) => {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL
  if (!baseUrl) {
    return new Response(JSON.stringify({ data: [] }))
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1000)

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN || ''}`,
      },
      signal: controller.signal,
      ...params,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return new Response(JSON.stringify({ data: [] }))
    }

    return response
  } catch (e) {
    return new Response(JSON.stringify({ data: [] }))
  }
}

// Homepage data
export const getHeroBannerData = async (): Promise<HeroBannerData> => {
  try {
    const res = await fetchStrapiClient(
      `/api/homepage?populate[1]=HeroBanner&populate[2]=HeroBanner.CTA&populate[3]=HeroBanner.Image`,
      {
        next: { tags: ['hero-banner'] },
      }
    )
    const json = await res.json()
    if (json?.data?.HeroBanner) return json
  } catch (e) {}

  return {
    data: {
      HeroBanner: {
        Headline: "NAAZ Luxury Women's Handbags (ناز)",
        Text: "Explore Pakistan's most exquisite luxury handbags, shoulder bags & clutches crafted for elegance and everyday style. Cash on delivery available across Pakistan.",
        CTA: {
          BtnText: "Shop Catalog",
          BtnLink: "/shop",
        },
        Image: {
          url: "https://www.markaz.app/api/export/image/1454-37-693018-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1454-37-693018-product-1.webp",
          alternativeText: "NAAZ Luxury Handbags",
        },
      },
    },
  } as any
}

export const getMidBannerData = async (): Promise<MidBannerData> => {
  try {
    const res = await fetchStrapiClient(
      `/api/homepage?populate[1]=MidBanner&populate[2]=MidBanner.CTA&populate[3]=MidBanner.Image`,
      {
        next: { tags: ['mid-banner'] },
      }
    )
    const json = await res.json()
    if (json?.data?.MidBanner) return json
  } catch (e) {}

  return {
    data: {
      MidBanner: {
        Headline: 'Handcrafted With Elegance & Passion',
        Text: 'From sleek everyday shoulder bags to luxury 3-piece sets — discover pieces designed to elevate every outfit with Pakistani craftsmanship.',
        CTA: {
          BtnText: 'Explore Collections',
          BtnLink: '/shop',
        },
        Image: {
          url: 'https://www.markaz.app/api/export/image/1598-39-708716-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-39-708716-product-1.webp',
          alternativeText: 'NAAZ Handbag Collection',
        },
      },
    },
  } as any
}

export const getCollectionsData = async (): Promise<CollectionsData> => {
  const res = await fetchStrapiClient(`/api/collections?&populate=*`, {
    next: { tags: ['collections-main'] },
  })

  return res.json()
}

export const getExploreBlogData = async (): Promise<BlogData> => {
  const res = await fetchStrapiClient(
    `/api/blogs?populate[1]=FeaturedImage&sort=createdAt:desc&pagination[start]=0&pagination[limit]=3`,
    {
      next: { tags: ['explore-blog'] },
    }
  )

  return res.json()
}

// Products
export const getProductVariantsColors = async (): Promise<VariantColorData> => {
  const res = await fetchStrapiClient(
    `/api/product-variants-colors?populate[1]=Type&populate[2]=Type.Image&pagination[start]=0&pagination[limit]=100`,
    {
      next: { tags: ['variants-colors'] },
    }
  )

  return res.json()
}

// About Us
export const getAboutUs = async (): Promise<AboutUsData> => {
  try {
    const res = await fetchStrapiClient(
      `/api/about-us?populate[1]=Banner&populate[2]=OurStory.Image&populate[3]=OurCraftsmanship.Image&populate[4]=WhyUs.Tile.Image&populate[5]=Numbers`,
      {
        next: { tags: ['about-us'] },
      }
    )
    const json = await res.json()
    if (json?.data?.Banner || json?.data?.OurStory) return json
  } catch (e) {}

  return {
    data: {
      Banner: {
        Headline: 'About NAAZ (ناز)',
        Text: 'Redefining elegance, quality, and timeless craftsmanship for women across Pakistan.',
        CTA: { BtnText: 'Shop Catalog', BtnLink: '/shop' },
        Image: {
          url: 'https://www.markaz.app/api/export/image/1454-37-693018-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1454-37-693018-product-1.webp',
        },
      },
      OurStory: {
        Heading: 'Our Story',
        Text: 'Founded with a passion for luxury fashion and everyday convenience, NAAZ brings premium handcrafted bags directly to your doorstep with nationwide Cash on Delivery.',
        Image: {
          url: 'https://www.markaz.app/api/export/image/1598-39-708716-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-39-708716-product-1.webp',
        },
      },
      WhyUs: null,
      OurCraftsmanship: null,
      Numbers: null,
    },
  } as any
}

// FAQ
export const getFAQ = async (): Promise<FAQData> => {
  try {
    const res = await fetchStrapiClient(
      `/api/faq?populate[1]=FAQSection&populate[2]=FAQSection.Question`,
      {
        next: { tags: ['faq'] },
      }
    )
    const json = await res.json()
    if (json?.data?.FAQSection) return json
  } catch (e) {}

  return {
    data: {
      FAQSection: [
        {
          id: 1,
          Title: 'Orders & Delivery',
          Question: [
            {
              id: 1,
              Question: 'What is the delivery time across Pakistan?',
              Answer: 'Standard delivery takes 2 to 4 working days across major cities in Pakistan.',
            },
            {
              id: 2,
              Question: 'Is Cash on Delivery (COD) available?',
              Answer: 'Yes! We offer 100% Cash on Delivery across all cities and towns in Pakistan.',
            },
          ],
        },
      ],
    },
  } as any
}

// Content Page
export const getContentPage = async (
  type: string,
  tag: string
): Promise<ContentPageData> => {
  try {
    const res = await fetchStrapiClient(`/api/${type}?populate=*`, {
      next: { tags: [tag] },
    })
    const json = await res.json()
    if (json?.data?.Content || json?.data?.Title) return json
  } catch (e) {}

  return {
    data: {
      Title: type.replace(/-/g, ' ').toUpperCase(),
      Content: 'Welcome to NAAZ. For customer support and inquiries, please reach out to us via support@naaz.pk.',
    },
  } as any
}

export const getBlogPosts = async ({
  sortBy = 'createdAt:desc',
  query,
  category,
}: {
  sortBy: string
  query?: string
  category?: string
}): Promise<BlogData> => {
  const baseUrl = `/api/blogs?populate[1]=FeaturedImage&populate[2]=Categories&sort=${sortBy}&pagination[limit]=1000`

  let urlWithFilters = baseUrl

  if (query) {
    urlWithFilters += `&filters[Title][$contains]=${query}`
  }

  if (category) {
    urlWithFilters += `&filters[Categories][Slug][$eq]=${category}`
  }

  try {
    const res = await fetchStrapiClient(urlWithFilters, {
      next: { tags: ['blog'] },
    })

    const json = await res.json()
    if (json?.data && json?.meta?.pagination) {
      return json
    }
  } catch (e) {}

  return {
    data: [
      {
        id: 1,
        Title: 'The Ultimate Guide to Styling Luxury Handbags in Pakistan',
        Slug: 'guide-styling-handbags-pakistan',
        Description: 'Discover how to pair shoulder bags, clutches and crossbody bags with both Eastern and Western outfits.',
        Content: 'Handbags are more than just accessories — they define your personal style.',
        createdAt: '2026-08-30T10:00:00.000Z',
        FeaturedImage: {
          url: 'https://www.markaz.app/api/export/image/1598-39-708716-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-39-708716-product-1.webp',
        },
        Categories: [],
      } as any,
    ],
    meta: {
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
        pageCount: 1,
      },
    },
  } as any
}

export const getBlogPostCategories = async (): Promise<BlogData> => {
  try {
    const res = await fetchStrapiClient(
      `/api/blog-post-categories?sort=createdAt:desc&pagination[limit]=100`,
      {
        next: { tags: ['blog-categories'] },
      }
    )

    const json = await res.json()
    if (json?.data) return json
  } catch (e) {}

  return {
    data: [],
    meta: {
      pagination: { total: 0, page: 1, pageSize: 10, pageCount: 0 },
    },
  } as any
}

// Blog
export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const res = await fetchStrapiClient(
    `/api/blogs?filters[Slug][$eq]=${slug}&populate=*`,
    {
      next: { tags: [`blog-${slug}`] },
    }
  )

  const data = await res.json()

  if (data.data && data.data.length > 0) {
    return data.data[0]
  }

  return null
}

export const getAllBlogSlugs = async (): Promise<string[]> => {
  const res = await fetchStrapiClient(`/api/blogs?populate=*`, {
    next: { tags: ['blog-slugs'] },
  })

  const data = await res.json()
  return data.data.map((post: BlogPost) => post.Slug)
}
