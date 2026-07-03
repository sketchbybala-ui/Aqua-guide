import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import CartItem from '../components/cart/CartItem.jsx'
import CartSummary from '../components/cart/CartSummary.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'

export default function Cart() {
  const { items, loading } = useCart()

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-lg text-slate-600">Your cart is empty.</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">
      <div className="md:col-span-2">
        <h1 className="mb-4 text-2xl font-bold text-slate-800">Your Cart</h1>
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div>
        <CartSummary />
      </div>
    </div>
  )
}
