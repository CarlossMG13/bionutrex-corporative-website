import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

interface Props {
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  total: number;
  email: string;
}

export function PaymentForm({ onSuccess, onBack, total, email }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Error al procesar el pago");
      setLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: {
          billing_details: { email },
        },
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Error al confirmar el pago");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-gray-900 font-black text-base uppercase tracking-wider mb-4">
          Información de pago
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <PaymentElement
            options={{
              layout: "tabs",
              fields: { billingDetails: { email: "never" } },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-black text-sm uppercase tracking-wider hover:border-gray-300 transition-colors disabled:opacity-50"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-[2] py-4 rounded-xl bg-[#0d40a5] text-white font-black text-sm uppercase tracking-wider hover:bg-[#0d40a5]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            `Pagar $${total.toFixed(2)}`
          )}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        Pago procesado de forma segura por Stripe. Tus datos están encriptados.
      </p>
    </form>
  );
}
