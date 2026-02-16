
import '@testing-library/jest-dom'

describe('Cart Calculations', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { id: '1', price: 100, quantity: 2 },
      { id: '2', price: 50, quantity: 1 }
    ]
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    expect(subtotal).toBe(250)
  })

  it('calculates total with shipping', () => {
    const subtotal = 250
    const shipping = 100
    const total = subtotal + shipping
    expect(total).toBe(350)
  })
})
