import { IconProps } from 'types/icon'

export const SolaceLogoBig = (props: IconProps) => {
  return (
    <div className="w-full py-6 flex flex-col items-center justify-center text-center select-none">
      <div className="flex items-center justify-center gap-4">
        <span className="text-6xl sm:text-8xl md:text-9xl font-black tracking-widest font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm">
          NAAZ
        </span>
        <span className="text-4xl sm:text-6xl md:text-7xl font-bold text-amber-500/80 font-serif">
          (ناز)
        </span>
      </div>
      <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-neutral-400 font-medium mt-2">
        Luxury Women's Handbags & Accessories • Pakistan
      </span>
    </div>
  )
}
