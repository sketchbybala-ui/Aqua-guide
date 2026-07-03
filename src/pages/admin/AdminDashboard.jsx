import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Manage the Aqua Guide product catalog.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/admin/products">
          <Button>Manage Products</Button>
        </Link>
        <Link to="/admin/products/new">
          <Button variant="secondary">Add New Product</Button>
        </Link>
      </div>
    </div>
  )
}
