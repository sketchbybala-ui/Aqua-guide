import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { AuthContext } from './AuthContext.jsx'

export const CartContext = createContext(null)

const LOCAL_CART_KEY = 'aqua-guide-cart'

function readLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) ?? []
  } catch {
    return []
  }
}

function writeLocalCart(items) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
}

async function attachProducts(rows) {
  const productIds = rows.map((r) => r.product_id)
  if (productIds.length === 0) return []
  const { data: products } = await supabase.from('products').select('*').in('id', productIds)
  const byId = Object.fromEntries((products ?? []).map((p) => [p.id, p]))
  return rows
    .map((r) => ({ ...r, product: byId[r.product_id] }))
    .filter((r) => r.product)
}

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDbCart = useCallback(async (userId) => {
    const { data } = await supabase
      .from('cart_items')
      .select('id, product_id, quantity')
      .eq('user_id', userId)
    setItems(await attachProducts(data ?? []))
  }, [])

  const loadLocalCart = useCallback(async () => {
    const local = readLocalCart()
    setItems(
      (await attachProducts(local.map((i) => ({ product_id: i.product_id, quantity: i.quantity })))).map(
        (i) => ({ ...i, id: i.product_id }),
      ),
    )
  }, [])

  // merge guest cart into DB cart on login, then load from DB
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      if (user) {
        const local = readLocalCart()
        if (local.length > 0) {
          for (const item of local) {
            await supabase
              .from('cart_items')
              .upsert(
                { user_id: user.id, product_id: item.product_id, quantity: item.quantity },
                { onConflict: 'user_id,product_id', ignoreDuplicates: false },
              )
          }
          writeLocalCart([])
        }
        if (!cancelled) await loadDbCart(user.id)
      } else {
        if (!cancelled) await loadLocalCart()
      }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user, loadDbCart, loadLocalCart])

  async function addItem(productId, quantity = 1) {
    if (user) {
      const existing = items.find((i) => i.product_id === productId)
      const newQty = (existing?.quantity ?? 0) + quantity
      await supabase
        .from('cart_items')
        .upsert(
          { user_id: user.id, product_id: productId, quantity: newQty },
          { onConflict: 'user_id,product_id' },
        )
      await loadDbCart(user.id)
    } else {
      const local = readLocalCart()
      const existing = local.find((i) => i.product_id === productId)
      const next = existing
        ? local.map((i) => (i.product_id === productId ? { ...i, quantity: i.quantity + quantity } : i))
        : [...local, { product_id: productId, quantity }]
      writeLocalCart(next)
      await loadLocalCart()
    }
  }

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return removeItem(itemId)
    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
      await loadDbCart(user.id)
    } else {
      const next = readLocalCart().map((i) => (i.product_id === itemId ? { ...i, quantity } : i))
      writeLocalCart(next)
      await loadLocalCart()
    }
  }

  async function removeItem(itemId) {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', itemId)
      await loadDbCart(user.id)
    } else {
      writeLocalCart(readLocalCart().filter((i) => i.product_id !== itemId))
      await loadLocalCart()
    }
  }

  async function clearCart() {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
      setItems([])
    } else {
      writeLocalCart([])
      setItems([])
    }
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * Number(i.product.price), 0)

  const value = { items, loading, addItem, updateQuantity, removeItem, clearCart, totalItems, totalPrice }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
