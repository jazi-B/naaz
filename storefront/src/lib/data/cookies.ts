'use server'

import { cookies } from 'next/headers'

export const getAuthHeaders = async (): Promise<
  { authorization?: string; 'x-publishable-api-key': string }
> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('_medusa_jwt')?.value
  const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_8744904071a9b5737f139ca9338d06bbdb2f5526b761e25fae4ccc5c705fdc2c'

  if (token) {
    return { authorization: `Bearer ${token}`, 'x-publishable-api-key': pk }
  }

  return { 'x-publishable-api-key': pk }
}

export const setAuthToken = async (token: string) => {
  const cookieStore = await cookies()

  cookieStore.set('_medusa_jwt', token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
}

export const removeAuthToken = async () => {
  const cookieStore = await cookies()
  cookieStore.set('_medusa_jwt', '', {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookieStore = await cookies()
  return cookieStore.get('_medusa_cart_id')?.value
}

export const setCartId = async (cartId: string) => {
  const cookieStore = await cookies()
  cookieStore.set('_medusa_cart_id', cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
}

export const removeCartId = async () => {
  const cookieStore = await cookies()
  cookieStore.set('_medusa_cart_id', '', { maxAge: -1 })
}
