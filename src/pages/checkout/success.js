import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../../context/CartContext'
import SEO from '../../components/SEO'
import { Icon } from '../../components/Primitives'

export default function CheckoutSuccess() {
  const router = useRouter()
  const { clearCart } = useCart()
  const orderNumber = typeof router.query.order === 'string' ? router.query.order : ''

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-container mx-auto px-8 py-20 text-center">
      <SEO title="Order placed" description="Order confirmed." path="/checkout/success" />
      <div className="w-[72px] h-[72px] rounded-full bg-success text-surface flex items-center justify-center mx-auto mb-6">
        <Icon name="check" size={32} />
      </div>
      <h1 className="font-display font-semibold tracking-display text-4xl m-0 mb-2 text-ink">
        Order placed.
      </h1>
      {orderNumber && (
        <p className="opp-meta-mono text-accent-strong mb-2">Order #{orderNumber}</p>
      )}
      <p className="text-ink-soft max-w-md mx-auto mb-8">
        Confirmation sent to your email. You&apos;ll receive a tracking number once it ships.
      </p>
      <button className="btn-primary" onClick={() => router.push('/')}>
        Back to Home <Icon name="arrow" size={16} />
      </button>
    </div>
  )
}
