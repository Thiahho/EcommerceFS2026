import PaymentForm from '../components/PaymentForm';

export default function CheckoutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">Checkout</h1>
        <p className="text-sm text-slate-600">
          Completá los datos de envío y pago para finalizar tu compra.
        </p>
      </header>
      <PaymentForm />
    </div>
  );
}
