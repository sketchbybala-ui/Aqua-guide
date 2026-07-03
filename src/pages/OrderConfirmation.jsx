import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import PriceTag from '../components/ui/PriceTag.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const STATUS_LABEL = {
  pending: { text: 'Payment Pending', color: 'text-amber-600' },
  paid: { text: 'Payment Successful', color: 'text-green-600' },
  failed: { text: 'Payment Failed', color: 'text-red-600' },
  shipped: { text: 'Shipped', color: 'text-brand-600' },
  delivered: { text: 'Delivered', color: 'text-green-600' },
  cancelled: { text: 'Cancelled', color: 'text-red-600' },
}

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).single()
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId)
      if (cancelled) return
      setOrder(orderData)
      setOrderItems(items ?? [])
      setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!order) {
    return <p className="py-24 text-center text-slate-500">Order not found.</p>
  }

  const status = STATUS_LABEL[order.status] ?? { text: order.status, color: 'text-slate-600' }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-800">Thank you for your order!</h1>
      <p className={`mt-2 font-medium ${status.color}`}>{status.text}</p>
      <p className="mt-1 text-sm text-slate-500">Order ID: {order.id}</p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
        <ul className="flex flex-col gap-2 text-sm text-slate-600">
          {orderItems.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <PriceTag amount={item.subtotal} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-800">
          <span>Total</span>
          <PriceTag amount={order.total_amount} />
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/profile">
          <Button variant="secondary">View Order History</Button>
        </Link>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
