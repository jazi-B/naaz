import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <Box className="flex flex-col gap-y-4">
      <Box className="flex flex-col gap-y-1" id="product-info">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="w-max text-md text-secondary"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          as="h2"
          className="text-2xl text-basic-primary small:text-3xl font-extrabold"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <span>✓</span> In Stock
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-600 dark:text-amber-400">
            <span>💵</span> Cash on Delivery
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-1 font-semibold text-blue-600 dark:text-blue-400">
            <span>🚚</span> Nationwide Delivery
          </span>
        </div>
      </Box>
    </Box>
  )
}

export default ProductInfo
