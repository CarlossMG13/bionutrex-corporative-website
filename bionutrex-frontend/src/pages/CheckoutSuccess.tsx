import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

// IVA helpers — el precio YA incluye IVA, se desglosa (no se suma)
function extractIVA(totalWithIVA: number) {
  const base = totalWithIVA / 1.16;
  const iva  = totalWithIVA - base;
  return { base, iva };
}

export default function CheckoutSuccess() {
  const location = useLocation();
  const { paymentIntentId, infoData, cartItems, cartTotal } =
    (location.state as {
      paymentIntentId: string;
      infoData: { fullName: string; email: string; address: string; city: string };
      cartItems: { product: { name: string }; variant: { name: string; price: number }; quantity: number }[];
      cartTotal: number;
    }) ?? {};

  const orderId    = paymentIntentId?.slice(-8).toUpperCase() ?? "——";
  const grandTotal = cartTotal ?? 0;
  const { base, iva } = extractIVA(grandTotal);

  return (
    <div
      className="min-h-screen bg-[#f4f4f4] flex flex-col pt-16 lg:pt-20"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Success card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-6">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              ¡Pedido confirmado!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Hemos recibido tu pedido. Recibirás un correo de confirmación en{" "}
              <span className="font-bold text-gray-700">{infoData?.email ?? "tu email"}</span>.
            </p>

            <div className="bg-gray-50 rounded-xl px-6 py-4 mb-6 inline-block">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                Número de pedido
              </p>
              <p className="text-2xl font-black text-[#0d40a5] tracking-wider">
                #{orderId}
              </p>
            </div>

            {/* Items recap */}
            {cartItems && cartItems.length > 0 && (
              <div className="text-left border-t border-gray-100 pt-5 space-y-3 mb-5">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-gray-800">
                        {item.product.name}{" "}
                        <span className="font-normal text-gray-400">×{item.quantity}</span>
                      </p>
                      <p className="text-gray-400 text-xs">{item.variant.name}</p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ${(item.variant.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                {/* IVA breakdown */}
                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal (sin IVA)</span>
                    <span>${base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IVA (16%)</span>
                    <span>${iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-[#0d40a5]">${grandTotal.toFixed(2)} MXN</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping info */}
            {infoData && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3 text-left">
                <Package className="w-5 h-5 text-[#0d40a5] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#0d40a5] font-bold text-xs uppercase tracking-wider mb-0.5">
                    Envío a
                  </p>
                  <p className="text-gray-700 text-sm font-medium">{infoData.fullName}</p>
                  <p className="text-gray-500 text-xs">
                    {infoData.address}, {infoData.city}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 py-3.5 text-center rounded-xl border-2 border-gray-200 text-gray-600 font-black text-sm uppercase tracking-wider hover:border-gray-300 transition-colors"
            >
              Ir al inicio
            </Link>
            <Link
              to="/catalogo"
              className="flex-1 py-3.5 text-center rounded-xl bg-[#0d40a5] text-white font-black text-sm uppercase tracking-wider hover:bg-[#0d40a5]/90 transition-colors flex items-center justify-center gap-2"
            >
              Seguir comprando
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
