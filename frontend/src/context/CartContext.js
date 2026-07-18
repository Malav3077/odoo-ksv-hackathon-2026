'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rentease_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('rentease_cart', JSON.stringify(items))
    }
  }, [items, hydrated])

  function addItem(product, quantity, rentalStart, rentalEnd) {
    setItems(prev => {
      const idx = prev.findIndex(
        i => i.product.id === product.id && i.rental_start === rentalStart && i.rental_end === rentalEnd
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, { product, quantity, rental_start: rentalStart, rental_end: rentalEnd }]
    })
  }

  function updateQty(productId, rentalStart, quantity) {
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId && i.rental_start === rentalStart
          ? { ...i, quantity }
          : i
      )
    )
  }

  function removeItem(productId, rentalStart) {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.rental_start === rentalStart)))
  }

  function clearCart() {
    setItems([])
    localStorage.removeItem('rentease_cart')
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
