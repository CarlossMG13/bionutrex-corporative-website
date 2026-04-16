import { useState, useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
// AnimatePresence + motion still used for the internal view-switch (login ↔ register)
import { X, User, Mail, Lock, Eye, EyeOff, Zap, CheckCircle, ArrowRight, LogIn } from "lucide-react";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { toast } from "sonner";

// ─── Tipos de vista ──────────────────────────────────────────────────────────
type View = "login" | "register" | "check-email";

// ─── Sub-componente: campo de input ──────────────────────────────────────────
function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  suffix,
}: {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <Icon className="absolute left-3.5 w-4 h-4 text-white/30 shrink-0" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full bg-white/8 border border-white/10 rounded-xl pl-10 pr-10 py-3
                   text-white text-sm placeholder-white/25 outline-none
                   focus:border-[#00e5ff]/50 focus:bg-white/10 transition-colors"
      />
      {suffix && <span className="absolute right-3.5">{suffix}</span>}
    </div>
  );
}

// ─── Vista: Login ─────────────────────────────────────────────────────────────
function LoginView({ onSwitch }: { onSwitch: () => void }) {
  const { login, closeAuth } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success("¡Bienvenido de nuevo!");
      closeAuth();
    } else {
      setError(result.error ?? "Error al iniciar sesión");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-1">
        <h2 className="text-white font-black text-xl tracking-tight uppercase italic">
          Iniciar sesión
        </h2>
        <p className="text-white/40 text-xs mt-1">
          Accede a tu cuenta para ver pedidos y favoritos
        </p>
      </div>

      <Field
        icon={Mail}
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />

      <Field
        icon={Lock}
        type={showPass ? "text" : "password"}
        placeholder="Contraseña"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        suffix={
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {error && (
        <p className="text-red-400 text-xs font-bold bg-red-400/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full py-3.5 bg-[#0d40a5] hover:bg-[#0d40a5]/80 disabled:opacity-50
                   text-white font-black text-xs uppercase tracking-widest rounded-xl
                   transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Entrar
          </>
        )}
      </button>

      <p className="text-center text-white/30 text-xs">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#00e5ff] font-bold hover:underline cursor-pointer"
        >
          Regístrate
        </button>
      </p>
    </form>
  );
}

// ─── Vista: Register ──────────────────────────────────────────────────────────
function RegisterView({
  onSwitch,
  onSuccess,
}: {
  onSwitch: () => void;
  onSuccess: (email: string) => void;
}) {
  const { register } = useAuthUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Ingresa tu nombre");
    if (!email) return setError("Ingresa tu correo");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres");
    if (password !== confirmPassword) return setError("Las contraseñas no coinciden");

    setLoading(true);
    const result = await register(email, password, name.trim());
    setLoading(false);

    if (result.success) {
      onSuccess(email);
    } else {
      setError(result.error ?? "Error al registrarse");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="mb-1">
        <h2 className="text-white font-black text-xl tracking-tight uppercase italic">
          Crear cuenta
        </h2>
        <p className="text-white/40 text-xs mt-1">
          Únete y accede a beneficios exclusivos
        </p>
      </div>

      <Field
        icon={User}
        type="text"
        placeholder="Nombre completo"
        value={name}
        onChange={setName}
        autoComplete="name"
      />
      <Field
        icon={Mail}
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />
      <Field
        icon={Lock}
        type={showPass ? "text" : "password"}
        placeholder="Contraseña (mín. 8 caracteres)"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        suffix={
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Field
        icon={Lock}
        type={showPass ? "text" : "password"}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
      />

      {error && (
        <p className="text-red-400 text-xs font-bold bg-red-400/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name || !email || !password || !confirmPassword}
        className="w-full py-3.5 bg-[#0d40a5] hover:bg-[#0d40a5]/80 disabled:opacity-50
                   text-white font-black text-xs uppercase tracking-widest rounded-xl
                   transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Crear cuenta
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-white/30 text-xs">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#00e5ff] font-bold hover:underline cursor-pointer"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
}

// ─── Vista: Check your email ──────────────────────────────────────────────────
function CheckEmailView({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="w-16 h-16 rounded-full bg-[#00e5ff]/10 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-[#00e5ff]" />
      </div>
      <div>
        <h2 className="text-white font-black text-xl tracking-tight uppercase italic mb-2">
          Revisa tu correo
        </h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Enviamos un link de verificación a{" "}
          <span className="text-white font-bold">{email}</span>.
          <br />
          Haz clic en el link para activar tu cuenta.
        </p>
      </div>
      <p className="text-white/25 text-xs leading-relaxed">
        ¿No lo ves? Revisa la carpeta de spam.
      </p>
      <button
        onClick={onBack}
        className="text-[#00e5ff] text-xs font-bold hover:underline cursor-pointer"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
}

// ─── AuthDrawer principal ─────────────────────────────────────────────────────
export function AuthDrawer() {
  const { isAuthOpen, closeAuth } = useAuthUser();
  const [view, setView] = useState<View>("login");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Lock body scroll — useLayoutEffect corre antes del primer paint,
  // evitando que el scrollbar desaparezca a mitad de la animación (stutter).
  useLayoutEffect(() => {
    if (isAuthOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isAuthOpen]);

  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setView("check-email");
  };

  const handleClose = () => {
    closeAuth();
    setTimeout(() => {
      setView("login");
      setRegisteredEmail("");
    }, 350);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={handleClose}
        style={{
          opacity: isAuthOpen ? 1 : 0,
          pointerEvents: isAuthOpen ? "auto" : "none",
          transition: "opacity 0.3s ease-out",
        }}
        className="fixed inset-0 bg-black/60 z-[59]"
      />

      {/* ── Panel ── */}
      <div
        style={{
          transform: isAuthOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s ease-out",
        }}
        className="fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-[#2a2a2a] z-[60] flex flex-col shadow-2xl"
        aria-hidden={!isAuthOpen}
      >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00e5ff] fill-[#00e5ff]" />
                <span className="text-white/60 text-xs font-black uppercase tracking-widest">
                  Mi cuenta
                </span>
              </div>
              <button
                onClick={handleClose}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Content — scrollable ── */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === "login" && (
                    <LoginView onSwitch={() => setView("register")} />
                  )}
                  {view === "register" && (
                    <RegisterView
                      onSwitch={() => setView("login")}
                      onSuccess={handleRegisterSuccess}
                    />
                  )}
                  {view === "check-email" && (
                    <CheckEmailView
                      email={registeredEmail}
                      onBack={() => setView("login")}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
      </div>
    </>
  );
}
