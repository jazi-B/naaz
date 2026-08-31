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
          url: "/images/hero-banner-luxury.jpg",
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
          url: '/images/mid-banner-luxury.jpg',
          alternativeText: 'NAAZ Handbag Collection',
        },
      },
    },
  } as any
}

export const getCollectionsData = async (): Promise<CollectionsData> => {
  try {
    const res = await fetchStrapiClient(`/api/collections?&populate=*`, {
      next: { tags: ['collections-main'] },
    })
    const json = await res.json()
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) return json
  } catch (e) {}

  return {
    data: [
      {
        id: 1,
        Title: 'Luxury Shoulder Bags',
        Handle: 'shoulder-bags',
        Description: 'Timeless structured & quilted designs crafted for sophistication.',
        Image: {
          url: 'https://www.markaz.app/api/export/image/1598-37-756464-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-37-756464-product-1.webp',
          alternativeText: 'Luxury Shoulder Bags',
        },
      },
      {
        id: 2,
        Title: 'Spacious Everyday Totes',
        Handle: 'totes',
        Description: 'Roomy elegance with premium leather finish for all your essentials.',
        Image: {
          url: 'https://www.markaz.app/api/export/image/1598-37-756475-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-37-756475-product-1.webp',
          alternativeText: 'Spacious Everyday Totes',
        },
      },
      {
        id: 3,
        Title: 'Clutches & Crossbody',
        Handle: 'clutches',
        Description: 'Compact charm with gold-accented chain straps for evening wear.',
        Image: {
          url: 'https://www.markaz.app/api/export/image/1598-37-756469-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-37-756469-product-1.webp',
          alternativeText: 'Clutches & Crossbody',
        },
      },
    ],
  } as any
}

export const getExploreBlogData = async (): Promise<BlogData> => {
  try {
    const res = await fetchStrapiClient(
      `/api/blogs?populate[1]=FeaturedImage&sort=createdAt:desc&pagination[start]=0&pagination[limit]=3`,
      {
        next: { tags: ['explore-blog'] },
      }
    )
    const json = await res.json()
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) return json
  } catch (e) {}

  return {
    data: [
      {
        id: 1,
        Title: 'The Ultimate Guide to Styling Luxury Handbags in Pakistan',
        Slug: 'guide-styling-handbags-pakistan',
        Description: 'Discover how to pair shoulder bags, clutches and crossbody bags with both Eastern and Western outfits.',
        Content: 'Handbags are more than just accessories — they define your personal style. In Pakistan, whether you are attending a formal wedding, heading to the university, or running everyday errands, choosing the right handbag elevates your entire aesthetic.',
        createdAt: '2026-08-30T10:00:00.000Z',
        FeaturedImage: {
          url: 'https://www.markaz.app/api/export/image/1598-37-756473-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-37-756473-product-1.webp',
          alternativeText: 'Luxury Handbags Styling',
        },
        Categories: [],
      },
      {
        id: 2,
        Title: 'Tote Bag vs. Shoulder Bag: Which One is Right for You?',
        Slug: 'tote-vs-shoulder-bag-everyday-guide',
        Description: 'Compare everyday capacity, comfort and elegance between spacious totes and sleek shoulder bags.',
        Content: 'Finding your ideal daily companion depends on your routine. Tote bags provide immense space for laptops and essentials, while shoulder bags offer effortless sophistication and structured charm.',
        createdAt: '2026-08-28T10:00:00.000Z',
        FeaturedImage: {
          url: 'https://www.markaz.app/api/export/image/1598-37-756468-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-37-756468-product-1.webp',
          alternativeText: 'Tote vs Shoulder Bag',
        },
        Categories: [],
      },
      {
        id: 3,
        Title: '5 Essential Care Tips to Keep Your Handbags Looking Brand New',
        Slug: 'caring-for-your-handbags-tips',
        Description: 'Simple everyday habits and storage methods to protect premium textures, chains and hardware.',
        Content: 'Investing in high quality bags means giving them proper care. Always store your bags with stuffing to maintain shape, avoid direct prolonged sunlight, and wipe clean with a soft microfiber cloth.',
        createdAt: '2026-08-25T10:00:00.000Z',
        FeaturedImage: {
          url: 'https://www.markaz.app/api/export/image/1598-37-756462-product-1.webp?src=https%3A%2F%2Fstatic.markaz.app%2Fpakistan%2Fproducts%2F1598-37-756462-product-1.webp',
          alternativeText: 'Handbag Care Tips',
        },
        Categories: [],
      },
    ],
    meta: {
      pagination: {
        total: 3,
        page: 1,
        pageSize: 3,
        pageCount: 1,
      },
    },
  } as any
}

// Products
export const getProductVariantsColors = async (): Promise<VariantColorData> => {
  try {
    const res = await fetchStrapiClient(
      `/api/product-variants-colors?populate[1]=Type&populate[2]=Type.Image&pagination[start]=0&pagination[limit]=100`,
      {
        next: { tags: ['variants-colors'] },
      }
    )
    const json = await res.json()
    if (json && Array.isArray(json.data)) return json
  } catch (e) {}

  return { data: [] } as any
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
          Title: 'Nationwide Delivery & Shipping',
          Bookmark: 'delivery-shipping',
          Question: [
            {
              id: 1,
              Question: 'What is the delivery time across Pakistan?',
              Answer: 'We deliver in 2 to 3 working days in major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan) and 3 to 4 working days for all other towns across Pakistan.',
            },
            {
              id: 2,
              Question: 'What are the delivery charges?',
              Answer: 'Standard delivery is flat Rs. 200 nationwide. We offer 100% FREE Delivery on all orders above Rs. 3,999!',
            },
            {
              id: 3,
              Question: 'Which couriers do you use for delivery?',
              Answer: 'We partner with Pakistan’s top courier services including TCS Express, Leopards Courier, and Trax Logistics with live tracking numbers provided on dispatch.',
            },
            {
              id: 4,
              Question: 'How can I track my parcel?',
              Answer: 'Simply visit our Track Order page (/pk/track-order) and enter your Order Number (e.g. 1) or Mobile Number to view live courier status.',
            },
          ],
        },
        {
          id: 2,
          Title: 'Payment & Cash on Delivery (COD)',
          Bookmark: 'payment-cod',
          Question: [
            {
              id: 5,
              Question: 'Do you offer Cash on Delivery (COD)?',
              Answer: 'Yes! We offer 100% Cash on Delivery across Pakistan. You only pay the courier rider in cash when the parcel arrives at your doorstep.',
            },
            {
              id: 6,
              Question: 'Do I need a credit card or advance payment?',
              Answer: 'No advance payment or credit card is required. All orders are processed directly on COD.',
            },
          ],
        },
        {
          id: 3,
          Title: '7-Day Returns & Exchange Policy',
          Bookmark: 'returns-exchange',
          Question: [
            {
              id: 7,
              Question: 'What is your return/exchange policy?',
              Answer: 'We offer a 7-day hassle-free exchange and return policy. If you receive a damaged, defective, or incorrect handbag, contact our WhatsApp support (+92 304 7437611) within 7 days for a free replacement or refund.',
            },
            {
              id: 8,
              Question: 'Do I need to make an unboxing video?',
              Answer: 'We highly recommend recording a short 30-second unboxing video when opening your package for instant one-click claim approval.',
            },
          ],
        },
        {
          id: 4,
          Title: 'Product Quality & Authenticity',
          Bookmark: 'product-quality',
          Question: [
            {
              id: 9,
              Question: 'Are the handbag photos real?',
              Answer: 'Yes! 100% of our photos and videos are authentic product previews directly matching the exact dimensions, stitching, zippers, and colors of the handbag you receive.',
            },
            {
              id: 10,
              Question: 'How can I place an order via WhatsApp?',
              Answer: 'Click the "Order on WhatsApp" button on any product page, or send a screenshot of the handbag to +92 304 7437611 along with your delivery address.',
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

  if (type === 'privacy-policy') {
    return {
      data: {
        Title: 'Privacy Policy',
        PageContent: `---
headings:
  - id: information-collection
    title: Information We Collect
  - id: use-of-information
    title: How We Use Your Data
  - id: data-protection
    title: Data Protection & Security
  - id: contact-us
    title: Contact Us
---

# Privacy Policy — NAAZ Women's Bags Pakistan (ناز)

At **NAAZ (ناز)**, we value your trust and are strictly committed to safeguarding the privacy of our customers across Pakistan.

### Information We Collect {#information-collection}
When you place a Cash on Delivery (COD) order on our store, we collect only the essential information needed to fulfill your shipment:
- **Full Name** & Contact Mobile Number (03XXXXXXXXX) for courier dispatch.
- **Complete Shipping Address & City** for accurate doorstep delivery via TCS, Leopards, or Trax.
- **Email Address** for automated order confirmation and tracking updates.

### How We Use Your Data {#use-of-information}
Your information is exclusively utilized for:
- Delivering your handbags safely to your doorstep.
- Sending SMS and WhatsApp tracking notifications.
- Providing 24/7 customer support, warranty assistance, and 7-day return processing.
- **We NEVER sell, rent, or share your personal data with any third-party advertisers.**

### Data Protection & Security {#data-protection}
All transactions and customer records on NAAZ are secured with end-to-end industry-standard SSL encryption. Your courier details are shared solely with licensed logistics partners for nationwide fulfillment.

### Contact Us {#contact-us}
If you have any questions regarding your personal information, contact our data privacy officer at **support@naaz.pk** or via WhatsApp at **+92 304 7437611**.
`,
      },
    } as any
  }

  return {
    data: {
      Title: 'Terms & Conditions (Return & Exchange Policy)',
      PageContent: `---
headings:
  - id: general-terms
    title: General Terms
  - id: cash-on-delivery
    title: Cash on Delivery & Order Verification
  - id: 7-day-returns
    title: 7-Day Return & Exchange Policy
  - id: shipping-rules
    title: Shipping & Delivery Rules
---

# Terms & Conditions & Return Policy — NAAZ (ناز)

Welcome to **NAAZ — Luxury Women's Handbags & Accessories Pakistan**. By browsing or placing an order on our store, you agree to the following terms.

### General Terms {#general-terms}
All handbag descriptions, dimensions (Length × Width in Inches), colors, and prices in Pakistani Rupees (PKR) are presented with complete transparency and accuracy.

### Cash on Delivery & Order Verification {#cash-on-delivery}
- We offer 100% Cash on Delivery (COD) nationwide across all cities and rural areas of Pakistan.
- Our customer care team may contact you via WhatsApp or SMS to confirm your delivery address before parcel dispatch.

### 7-Day Return & Exchange Policy {#7-day-returns}
We stand behind the craftsmanship of every handbag we deliver:
1. **Defective / Damaged Items:** If your handbag arrives with any zipper defect, stitching issue, or color mismatch, notify us within **7 days** on WhatsApp (+92 304 7437611). We will arrange a **100% free courier replacement or full refund**.
2. **Change of Mind:** If you wish to exchange your bag for another color or model, you can return it in its original unused packaging within 7 days.
3. **Unboxing Video:** For fastest resolution, please record a short unboxing video upon receiving the parcel.

### Shipping & Delivery Rules {#shipping-rules}
- Standard Delivery Fee is Rs. 200 nationwide.
- Orders over Rs. 3,999 qualify for **FREE Shipping**.
- Delivery takes 2-4 working days via TCS, Leopards, or Trax.
`,
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
  try {
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
  } catch (e) {}

  const exploreData = await getExploreBlogData()
  const found = exploreData.data.find((p) => p.Slug === slug)
  if (found) return found

  return exploreData.data[0] || null
}

export const getAllBlogSlugs = async (): Promise<string[]> => {
  const res = await fetchStrapiClient(`/api/blogs?populate=*`, {
    next: { tags: ['blog-slugs'] },
  })

  const data = await res.json()
  return data.data.map((post: BlogPost) => post.Slug)
}
