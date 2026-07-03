import { useParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts.js'
import ProductGrid from '../components/product/ProductGrid.jsx'

const CATEGORY_TITLES = {
  'home-use': 'Home Use Purifiers',
  'commercial-use': 'Commercial Use Purifiers',
}

export default function CategoryListing() {
  const { slug } = useParams()
  const { products, loading } = useProducts({ categorySlug: slug })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {CATEGORY_TITLES[slug] ?? 'Products'}
      </h1>
      <ProductGrid products={products} loading={loading} />
    </div>
  )
}
