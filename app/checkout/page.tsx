import { CheckoutContent } from '@/components/checkout-content'

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-24">
      <div className="mb-12 text-center">
        <p className="text-sm tracking-[0.4em] uppercase text-gold-dim mb-4">
          Checkout
        </p>
        <h1 className="text-3xl md:text-4xl font-light text-foreground">
          {'Thanh toán & Chứng thư'}
        </h1>
      </div>
      <CheckoutContent />
    </div>
  )
}
