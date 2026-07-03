import { Link } from 'react-router-dom'
import PriceTag from '../ui/PriceTag.jsx'
import Button from '../ui/Button.jsx'
import { useCart } from '../../hooks/useCart.js'

export default function CartSummary({ checkoutTo = '/checkout' }) {
  const { totalItems, totalPrice } = useCart()

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-lg font-semibold text-slate-800">Order Summary</h2>
      <div className="mt-4 flex justify-between text-sm text-slate-600">
        <span>Items ({totalItems})</span>
        <PriceTag amount={totalPrice} />
      </div>
      <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-800">
        <span>Total</span>
        <PriceTag amount={totalPrice} />
      </div>
      <Link to={checkoutTo} className="mt-4 block">
        <Button className="w-full" disabled={totalItems === 0}>
          Proceed to Checkout
        </Button>
      </Link>
    </div>
  )
}
