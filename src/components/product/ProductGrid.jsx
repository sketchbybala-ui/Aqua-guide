import ProductCard from './ProductCard.jsx'
import Spinner from '../ui/Spinner.jsx'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (products.length === 0) {
    return <p className="py-16 text-center text-slate-500">No products found.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
