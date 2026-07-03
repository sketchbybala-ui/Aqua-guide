import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts.js'
import ProductGrid from '../components/product/ProductGrid.jsx'
import Button from '../components/ui/Button.jsx'

export default function Home() {
  const { products, loading } = useProducts()

  return (
    <div>
      <section className="bg-brand-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">
            Pure Water. Better Life.
          </h1>
          <p className="max-w-xl text-slate-600">
            Aqua Guide brings you reliable water purifiers for every home and every business —
            from compact RO systems to industrial-scale plants.
          </p>
          <div className="flex gap-3">
            <Link to="/category/home-use">
              <Button>Shop Home Use</Button>
            </Link>
            <Link to="/category/commercial-use">
              <Button variant="secondary">Shop Commercial Use</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold text-slate-800">Featured Purifiers</h2>
        <ProductGrid products={products.slice(0, 8)} loading={loading} />
      </section>
    </div>
  )
}
