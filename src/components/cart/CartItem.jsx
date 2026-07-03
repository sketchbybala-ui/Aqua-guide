import { Link } from 'react-router-dom'
import PriceTag from '../ui/PriceTag.jsx'
import { useCart } from '../../hooks/useCart.js'

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-center gap-4 border-b border-slate-100 py-4">
      <img
        src={item.product.image_url}
        alt={item.product.name}
        className="h-20 w-20 rounded-lg object-cover"
      />
      <div className="flex-1">
        <Link to={`/product/${item.product.slug}`} className="font-medium text-slate-800 hover:text-brand-600">
          {item.product.name}
        </Link>
        <div className="mt-1">
          <PriceTag amount={item.product.price} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="h-8 w-8 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="h-8 w-8 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <p className="w-24 text-right font-semibold text-slate-800">
        <PriceTag amount={item.product.price * item.quantity} />
      </p>
      <button
        onClick={() => removeItem(item.id)}
        className="text-sm font-medium text-red-500 hover:text-red-600"
      >
        Remove
      </button>
    </div>
  )
}
