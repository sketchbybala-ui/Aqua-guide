import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts.js'
import { useCart } from '../hooks/useCart.js'
import PriceTag from '../components/ui/PriceTag.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { product, loading, error } = useProduct(slug)
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (error || !product) {
    return <p className="py-24 text-center text-slate-500">Product not found.</p>
  }

  async function handleAddToCart() {
    setAdding(true)
    await addItem(product.id, quantity)
    setAdding(false)
  }

  async function handleBuyNow() {
    await addItem(product.id, quantity)
    navigate('/cart')
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          {product.category?.name}
        </p>
        <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
        <PriceTag amount={product.price} className="text-2xl" />
        <p className="leading-relaxed text-slate-600">{product.description}</p>

        <p className="text-sm">
          {product.stock_quantity > 0 ? (
            <span className="text-green-600">In stock ({product.stock_quantity} available)</span>
          ) : (
            <span className="text-red-500">Out of stock</span>
          )}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-300">
            <button
              className="h-10 w-10 text-slate-600 hover:bg-slate-50"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="w-10 text-center">{quantity}</span>
            <button
              className="h-10 w-10 text-slate-600 hover:bg-slate-50"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleAddToCart}
            disabled={adding || product.stock_quantity <= 0}
          >
            {adding ? 'Adding…' : 'Add to Cart'}
          </Button>
          <Button onClick={handleBuyNow} disabled={product.stock_quantity <= 0}>
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  )
}
