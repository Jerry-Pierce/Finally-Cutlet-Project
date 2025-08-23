import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// useLanguage 모킹
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    t: (key: string) => key, // Key is returned as is for testing
  }),
}))

describe('HomePage', () => {
  it('renders main heading', () => {
    render(<HomePage />)
    expect(screen.getByText('shortenLong')).toBeInTheDocument()
  })

  it('renders get started button', () => {
    render(<HomePage />)
    expect(screen.getByText('getStarted')).toBeInTheDocument()
  })

  it('renders features section', () => {
    render(<HomePage />)
    expect(screen.getByText('whyChooseCutlet')).toBeInTheDocument()
  })

  it('renders pricing section', () => {
    render(<HomePage />)
    expect(screen.getByText('viewPricing')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<HomePage />)
    expect(screen.getByText('fastUrlShortening')).toBeInTheDocument()
  })

  it('renders landing description', () => {
    render(<HomePage />)
    expect(screen.getByText('landingDescription')).toBeInTheDocument()
  })
})
