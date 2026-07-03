import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import PriceTag from '../components/ui/PriceTag.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const STATUS_COLOR = {
  pending: 'text-amber-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
  shipped: 'text-brand-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-600',
}

export default function Profile() {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!cancelled) {
        setOrders(data ?? [])
        setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user.id])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-500">Name</p>
        <p className="font-medium text-slate-800">{profile?.full_name || '—'}</p>
        <p className="mt-3 text-sm text-slate-500">Email</p>
        <p className="font-medium text-slate-800">{user.email}</p>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-semibold text-slate-800">Order History</h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-slate-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/order-confirmation/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm text-slate-500">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-slate-400">{order.id}</p>
              </div>
              <p className={`text-sm font-medium ${STATUS_COLOR[order.status] ?? 'text-slate-600'}`}>
                {order.status}
              </p>
              <PriceTag amount={order.total_amount} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
