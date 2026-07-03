import { Link } from 'react-router-dom'
import PriceTag from '../ui/PriceTag.jsx'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceTag amount={product.price} />
          {product.stock_quantity <= 0 && (
            <span className="text-xs font-medium text-red-500">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  )
}
