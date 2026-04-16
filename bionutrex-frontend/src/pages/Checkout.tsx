import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Zap, ChevronRight, MapPin, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import api, { userAPI } from "@/services/api";
import type { UserAddress } from "@/types";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

const infoSchema = z.object({
  fullName: z.string().min(3, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido"),
  address: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  state: z.string().min(2, "Estado requerido"),
  zip: z.string().min(4, "Código postal inválido"),
});

type InfoData = z.infer<typeof infoSchema>;

const STEPS = ["Información", "Pago"];

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [infoData, setInfoData] = useState<InfoData | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);

  // Direcciones guardadas
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [addressMode, setAddressMode] = useState<"saved" | "new">("new");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Evita que clearCart() en handlePaymentSuccess dispare el redirect a /catalogo
  const paymentSucceeded = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InfoData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  // Cargar direcciones guardadas si el usuario está autenticado
  useEffect(() => {
    if (!user) return;
    userAPI.getAddresses()
      .then(({ data }) => {
        setSavedAddresses(data);
        if (data.length > 0) {
          setAddressMode("saved");
          const def = data.find((a) => a.isDefault) ?? data[0];
          setSelectedAddressId(def.id);
          // Pre-llenar campos ocultos para que zod los valide correctamente
          setValue("address", def.address);
          setValue("city", def.city);
          setValue("state", def.state);
          setValue("zip", def.zip);
        }
      })
      .catch(() => {});
  }, [user, setValue]);

  // Cuando cambia la dirección seleccionada, actualiza los valores del form
  useEffect(() => {
    if (addressMode === "saved" && selectedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setValue("address", addr.address);
        setValue("city", addr.city);
        setValue("state", addr.state);
        setValue("zip", addr.zip);
      }
    } else if (addressMode === "new") {
      setValue("address", "");
      setValue("city", "");
      setValue("state", "");
      setValue("zip", "");
    }
  }, [addressMode, selectedAddressId, savedAddresses, setValue]);

  // Redirect si el carrito está vacío — SOLO si el pago no fue exitoso
  useEffect(() => {
    if (cartItems.length === 0 && !paymentSucceeded.current) {
      navigate("/catalogo");
    }
  }, [cartItems, navigate]);

  const onInfoSubmit = async (data: InfoData) => {
    setInfoData(data);
    setLoadingIntent(true);
    try {
      const res = await api.post("/checkout/payment-intent", {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.variant.price,
          quantity: item.quantity,
        })),
      });
      setClientSecret(res.data.clientSecret);
      setStep(1);
    } catch {
      // error handled by api interceptor
    } finally {
      setLoadingIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Marcar ANTES de limpiar el carrito para evitar el redirect a /catalogo
    paymentSucceeded.current = true;
    try {
      await api.post("/checkout/confirm", { paymentIntentId });
    } catch {
      // si falla el confirm, el webhook de Stripe lo resolvería en producción
    }
    clearCart();
    navigate("/checkout/success", {
      state: { paymentIntentId, infoData, cartItems, cartTotal },
    });
  };

  const grandTotal = cartTotal;

  return (
    <div className="min-h-screen bg-[#f4f4f4]" style={{ fontFamily: "'Raleway', sans-serif" }}>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <Zap className="w-6 h-6 text-[#00e5ff] fill-[#00e5ff]" />
            <span className="text-xl font-black tracking-tighter uppercase italic text-black">
              Bionutrex
            </span>
          </Link>

          {/* Steps indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                        ? "bg-[#0d40a5] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${
                      i === step ? "text-[#0d40a5]" : "text-gray-400"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                )}
              </div>
            ))}
          </div>

          <Link
            to="/catalogo"
            className="text-xs text-gray-400 hover:text-gray-600 font-bold uppercase tracking-wider transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left: Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">

            {/* ── STEP 0: Información ── */}
            {step === 0 && (
              <form onSubmit={handleSubmit(onInfoSubmit)} className="space-y-8">
                {/* Contacto */}
                <div>
                  <h3 className="text-gray-900 font-black text-base uppercase tracking-wider mb-4 pb-3 border-b border-gray-100">
                    Contacto
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Nombre completo
                      </label>
                      <input
                        {...register("fullName")}
                        placeholder="Juan García"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d40a5] outline-none text-gray-900 text-sm font-medium transition-colors"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Email
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="juan@email.com"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d40a5] outline-none text-gray-900 text-sm font-medium transition-colors"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Teléfono
                      </label>
                      <input
                        {...register("phone")}
                        placeholder="55 1234 5678"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d40a5] outline-none text-gray-900 text-sm font-medium transition-colors"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Envío */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                    <h3 className="text-gray-900 font-black text-base uppercase tracking-wider">
                      Dirección de envío
                    </h3>
                    {/* Selector si el usuario tiene direcciones guardadas */}
                    {savedAddresses.length > 0 && (
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setAddressMode("saved")}
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                            addressMode === "saved"
                              ? "bg-white text-[#0d40a5] shadow-sm"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          Guardada
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddressMode("new")}
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                            addressMode === "new"
                              ? "bg-white text-[#0d40a5] shadow-sm"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          Nueva
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Direcciones guardadas */}
                  {addressMode === "saved" && savedAddresses.length > 0 && (
                    <div className="space-y-3 mb-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors cursor-pointer ${
                            selectedAddressId === addr.id
                              ? "border-[#0d40a5] bg-[#0d40a5]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <MapPin
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              selectedAddressId === addr.id ? "text-[#0d40a5]" : "text-gray-400"
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-black uppercase tracking-wider ${
                                selectedAddressId === addr.id ? "text-[#0d40a5]" : "text-gray-600"
                              }`}>
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-black bg-[#0d40a5]/10 text-[#0d40a5] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm font-medium mt-0.5">{addr.address}</p>
                            <p className="text-gray-400 text-xs">{addr.city}, {addr.state} {addr.zip}</p>
                          </div>
                        </button>
                      ))}
                      <Link
                        to="/perfil?tab=datos"
                        target="_blank"
                        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#0d40a5] transition-colors mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar dirección en mi perfil
                      </Link>
                    </div>
                  )}

                  {/* Formulario de nueva dirección */}
                  {addressMode === "new" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Dirección
                        </label>
                        <input
                          {...register("address")}
                          placeholder="Calle, número, colonia"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d40a5] outline-none text-gray-900 text-sm font-medium transition-colors"
                        />
                        {errors.address && (
                          <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Ciudad
                        </label>
                        <input
                          {...register("city")}
                          placeholder="Ciudad de México"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d40a5] outline-none text-gray-900 text-sm font-medium transition-colors"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Estado
                        </label>
                        <input
                          {...register("state")}
                          placeholder="CDMX"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d40a5] outline-none text-gray-900 text-sm font-medium transition-colors"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          Código postal
                        </label>
                        <input
                          {...register("zip")}
                          placeholder="06600"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d40a5] outline-none text-gray-900 text-sm font-medium transition-colors"
                        />
                        {errors.zip && (
                          <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loadingIntent}
                  className="w-full py-4 bg-[#0d40a5] text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-[#0d40a5]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingIntent ? "Preparando pago..." : "Continuar al pago"}
                </button>
              </form>
            )}

            {/* ── STEP 1: Pago ── */}
            {step === 1 && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  fonts: [
                    {
                      cssSrc:
                        "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&display=swap",
                    },
                  ],
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#0d40a5",
                      colorBackground: "#f9fafb",
                      colorText: "#111827",
                      borderRadius: "12px",
                      fontFamily: "'Raleway', sans-serif",
                      fontSizeBase: "14px",
                      fontWeightNormal: "600",
                    },
                  },
                }}
              >
                {/* Info recap */}
                {infoData && (
                  <div className="bg-gray-50 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-bold text-sm">{infoData.fullName}</p>
                      <p className="text-gray-400 text-xs">{infoData.email} · {infoData.address}, {infoData.city}</p>
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="text-[#0d40a5] text-xs font-bold uppercase tracking-wider hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                )}

                <PaymentForm
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setStep(0)}
                  total={grandTotal}
                  email={infoData?.email ?? ""}
                />
              </Elements>
            )}
          </div>

          {/* Right: Order summary */}
          <OrderSummary cartItems={cartItems} cartTotal={cartTotal} />
        </div>
      </div>
    </div>
  );
}
