import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid')
    })

    it('handles empty strings', () => {
      expect(cn('base', '', 'valid')).toBe('base valid')
    })

    it('handles objects with conditional classes', () => {
      expect(cn('base', { 'conditional': true, 'hidden': false })).toBe('base conditional')
    })

    it('handles arrays of classes', () => {
      expect(cn('base', ['class1', 'class2'])).toBe('base class1 class2')
    })
  })
})
