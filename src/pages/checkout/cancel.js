import { useRouter } from 'next/router'
import SEO from '../../components/SEO'
import { Icon } from '../../components/Primitives'

export default function CheckoutCancel() {
  const router = useRouter()
  const orderNumber = typeof router.query.order === 'string' ? router.query.order : ''

  return (
    <div className="max-w-container mx-auto px-8 py-20 text-center">
      <SEO title="Payment not completed" description="Payment was not completed." path="/checkout/cancel" />
      <div className="w-[72px] h-[72px] rounded-full bg-surfaceAlt border border-line text-ink flex items-center justify-center mx-auto mb-6">
        <Icon name="info" size={32} />
      </div>
      <h1 className="font-display font-semibold tracking-display text-4xl m-0 mb-2 text-ink">
        Payment not completed.
      </h1>
      {orderNumber && (
        <p className="opp-meta-mono text-ink-mute mb-2">Order #{orderNumber}</p>
      )}
      <p className="text-ink-soft max-w-md mx-auto mb-8">
        Your card was not charged. Your cart is still saved — you can resume checkout or pick a different payment method.
      </p>
      <div className="flex gap-3 justify-center">
        <button className="btn-primary" onClick={() => router.push('/checkout')}>
          Resume checkout <Icon name="arrow" size={16} />
        </button>
        <button className="btn-outline" onClick={() => router.push('/shop')}>
          Back to shop
        </button>
      </div>
    </div>
  )
}
