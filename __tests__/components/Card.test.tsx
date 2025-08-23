import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

describe('Card Components', () => {
  it('renders Card with content', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders CardHeader with title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders CardHeader with description', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Card Description')).toBeInTheDocument()
  })

  it('renders CardContent with content', () => {
    render(
      <Card>
        <CardContent>
          <p>Content text</p>
        </CardContent>
      </Card>
    )
    expect(screen.getByText('Content text')).toBeInTheDocument()
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>This is a complete card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content here</p>
        </CardContent>
      </Card>
    )

    expect(screen.getByText('Complete Card')).toBeInTheDocument()
    expect(screen.getByText('This is a complete card')).toBeInTheDocument()
    expect(screen.getByText('Card content here')).toBeInTheDocument()
  })
})
