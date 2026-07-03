export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function PriceTag({ amount, className = '' }) {
  return <span className={`font-semibold text-brand-700 ${className}`}>{formatINR(amount)}</span>
}
