const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise = null

function loadRazorpayScript() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'))
    document.body.appendChild(script)
  })
  return scriptPromise
}

/**
 * Opens the Razorpay Checkout widget.
 * @param {{ razorpayOrderId: string, amount: number, name: string, email: string, contact: string }} opts
 * @returns {Promise<{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }>}
 */
export async function openRazorpayCheckout({ razorpayOrderId, amount, name, email, contact }) {
  await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      name: 'Aqua Guide',
      description: 'Water Purifier Order',
      image: '/logo.png',
      order_id: razorpayOrderId,
      prefill: { name, email, contact },
      theme: { color: '#2563eb' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    })
    rzp.on('payment.failed', (response) => reject(response.error))
    rzp.open()
  })
}
