'use client'

import { IconProps } from 'types/icon'

export const SolaceLogo = (props: IconProps) => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/images/logo_transparent.png"
        alt="NAAZ — ناز Women's Bags & Accessories"
        className="h-8 medium:h-10 w-auto object-contain drop-shadow-md"
        onError={(e) => {
          // Fallback if image fails
          e.currentTarget.style.display = 'none'
        }}
      />
      <span className="font-extrabold tracking-widest text-lg medium:text-xl text-amber-500 uppercase font-serif">
        NAAZ
      </span>
    </div>
  )
}
