import type { ProductVariant } from '@/types'
import {
  getProductFallbackImage,
  getVariantMainImage,
} from '@/hooks/useSelectedVariantDisplay'

// The storefront only reads `image_url` off a variant for image selection,
// so a minimal cast keeps these tests focused on the fallback behaviour.
const makeVariant = (image_url: string | null): ProductVariant =>
  ({ image_url } as ProductVariant)

describe('getProductFallbackImage', () => {
  it('returns the first product image when available', () => {
    expect(getProductFallbackImage(['a.jpg', 'b.jpg'])).toBe('a.jpg')
  })

  it('falls back to the placeholder when the image list is empty', () => {
    expect(getProductFallbackImage([])).toBe('/placeholder.png')
  })

  it('falls back to the placeholder when images is undefined', () => {
    expect(getProductFallbackImage(undefined)).toBe('/placeholder.png')
  })
})

describe('getVariantMainImage', () => {
  it('prefers the selected variant image', () => {
    expect(getVariantMainImage(['a.jpg'], makeVariant('variant.jpg'))).toBe(
      'variant.jpg'
    )
  })

  it('falls back to the first product image when the variant has no image', () => {
    expect(getVariantMainImage(['a.jpg'], makeVariant(null))).toBe('a.jpg')
  })

  it('falls back to the placeholder with no variant and no images', () => {
    expect(getVariantMainImage(undefined, null)).toBe('/placeholder.png')
  })
})
