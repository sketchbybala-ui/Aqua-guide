import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { openRazorpayCheckout } from '../lib/razorpay.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCart } from '../hooks/useCart.js'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import PriceTag from '../components/ui/PriceTag.jsx'

const emptyAddress = {
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
}

export default function Checkout() {
  const { user, profile } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState({ ...emptyAddress, full_name: profile?.full_name ?? '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function updateField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: totalPrice,
          shipping_address: address,
        })
        .select()
        .single()
      if (orderError) throw orderError

      const orderItemsPayload = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }))
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload)
      if (itemsError) throw itemsError

      const { data: rzpOrder, error: fnError } = await supabase.functions.invoke(
        'create-razorpay-order',
        { body: { order_id: order.id } },
      )
      if (fnError) throw fnError

      const paymentResult = await openRazorpayCheckout({
        razorpayOrderId: rzpOrder.razorpay_order_id,
        amount: rzpOrder.amount,
        name: address.full_name,
        email: user.email,
        contact: address.phone,
      })

      const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          order_id: order.id,
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature,
        },
      })
      if (verifyError) throw verifyError

      await clearCart()
      navigate(`/order-confirmation/${order.id}`)
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return <p className="py-24 text-center text-slate-500">Your cart is empty.</p>
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-3">
      <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4 md:col-span-2">
        <h1 className="text-2xl font-bold text-slate-800">Shipping Details</h1>
        <Input
          label="Full name"
          required
          value={address.full_name}
          onChange={(e) => updateField('full_name', e.target.value)}
        />
        <Input
          label="Phone"
          type="tel"
          required
          value={address.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        <Input
          label="Address line 1"
          required
          value={address.line1}
          onChange={(e) => updateField('line1', e.target.value)}
        />
        <Input
          label="Address line 2 (optional)"
          value={address.line2}
          onChange={(e) => updateField('line2', e.target.value)}
        />
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="City"
            required
            value={address.city}
            onChange={(e) => updateField('city', e.target.value)}
          />
          <Input
            label="State"
            required
            value={address.state}
            onChange={(e) => updateField('state', e.target.value)}
          />
          <Input
            label="PIN code"
            required
            value={address.postal_code}
            onChange={(e) => updateField('postal_code', e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={submitting} className="mt-2">
          {submitting ? 'Processing…' : 'Place Order & Pay'}
        </Button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-800">Order Summary</h2>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <PriceTag amount={item.product.price * item.quantity} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-800">
          <span>Total</span>
          <PriceTag amount={totalPrice} />
        </div>
      </div>
    </div>
  )
}
