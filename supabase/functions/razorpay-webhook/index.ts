import { createClient } from 'npm:@supabase/supabase-js@2'

// Safety net: Razorpay calls this directly on payment events, so an order
// still gets marked paid/failed even if the customer's browser closes
// right after payment, before the client can call verify-razorpay-payment.
// Deploy with `supabase functions deploy razorpay-webhook --no-verify-jwt`
// since Razorpay cannot send a Supabase user JWT — trust is established via
// the Razorpay webhook signature instead.

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function hmacSha256Hex(secret: string, message: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const expected = await hmacSha256Hex(RAZORPAY_WEBHOOK_SECRET, rawBody)
  if (expected !== signature) {
    return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const payment = event.payload?.payment?.entity
  const nextStatus =
    event.event === 'payment.captured' ? 'paid' : event.event === 'payment.failed' ? 'failed' : null

  if (payment?.order_id && nextStatus) {
    const { data: order } = await adminClient
      .from('orders')
      .select('id, status')
      .eq('razorpay_order_id', payment.order_id)
      .single()

    if (order && order.status !== 'paid') {
      await adminClient
        .from('orders')
        .update({ status: nextStatus, razorpay_payment_id: payment.id })
        .eq('id', order.id)

      if (nextStatus === 'paid') {
        const { data: items } = await adminClient
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', order.id)

        for (const item of items ?? []) {
          if (!item.product_id) continue
          await adminClient.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          })
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
