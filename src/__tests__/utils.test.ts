import { cn } from '@/lib/utils'

describe('cn (className merge)', () => {
  it('joins multiple class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('dedupes conflicting tailwind utilities, keeping the last', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    const isHidden: boolean = false
    expect(cn('base', isHidden && 'hidden', undefined, null, '', 'active')).toBe(
      'base active'
    )
  })

  it('supports conditional object syntax', () => {
    expect(cn('text-red-500', { 'font-bold': true, italic: false })).toBe('text-red-500 font-bold')
  })
})
