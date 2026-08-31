import { cache } from 'react'

import { sdk } from '@lib/config'
import medusaError from '@lib/util/medusa-error'
import { HttpTypes } from '@medusajs/types'

export const listRegions = cache(async function () {
  return sdk.store.region
    .list({}, { next: { tags: ['regions'] } })
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {}, { next: { tags: ['regions'] } })
    .then(({ region }) => region)
    .catch(medusaError)
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async function (countryCode: string) {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions || !Array.isArray(regions) || regions.length === 0) {
      return {
        id: 'reg_01M19WDFQ1PQ29KMRD2KSP6D0T',
        name: 'Pakistan',
        currency_code: 'pkr',
        countries: [{ iso_2: 'pk' }, { iso_2: 'us' }],
      } as any
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? '', region)
      })
    })

    const targetCode = (countryCode || 'pk').toLowerCase()
    const region = regionMap.get(targetCode) || regions[0]

    return region
  } catch (e: any) {
    return {
      id: 'reg_01M19WDFQ1PQ29KMRD2KSP6D0T',
      name: 'Pakistan',
      currency_code: 'pkr',
      countries: [{ iso_2: 'pk' }, { iso_2: 'us' }],
    } as any
  }
})
