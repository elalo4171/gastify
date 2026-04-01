"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      if (!name.trim()) {
        setError("Ingresa tu nombre");
        setLoading(false);
        return;
      }
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre: name.trim() },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Seed default categories for the new user
      if (signUpData.user) {
        await fetch("/api/auth/seed-categories", {
          method: "POST",
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message === "Email not confirmed") {
          setLoading(false);
          setShowEmailModal(true);
          return;
        }
        setError(
          error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos"
            : error.message
        );
        setLoading(false);
        return;
      }
    }

    router.refresh();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-accent)]">
            Gastify
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Finanzas personales, simple
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-[var(--color-bg-secondary)] rounded-xl p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === m
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full py-3 px-4 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            minLength={6}
            className="w-full py-3 px-4 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
          />

          {error && (
            <p className="text-xs text-[var(--color-expense)] text-center py-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading
              ? "..."
              : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </form>

        {mode === "login" && (
          <p className="text-xs text-center mt-4">
            <button
              onClick={() => { setShowForgot(true); setError(""); setForgotSent(false); }}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        )}

        <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-8">
          {mode === "login"
            ? "¿No tienes cuenta? "
            : "¿Ya tienes cuenta? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-[var(--color-accent)] font-semibold"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-overlay">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowForgot(false)} />
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-8 max-w-sm mx-6 text-center animate-scale-in">
            {forgotSent ? (
              <>
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                  Revisa tu email
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                  Si existe una cuenta con <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>, recibirás un enlace para restablecer tu contraseña.
                </p>
                <button
                  onClick={() => setShowForgot(false)}
                  className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98]"
                >
                  Entendido
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                  Recuperar contraseña
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all mb-3"
                />
                {error && (
                  <p className="text-xs text-[var(--color-expense)] text-center py-1 mb-2">{error}</p>
                )}
                <button
                  onClick={async () => {
                    if (!email) { setError("Ingresa tu email"); return; }
                    setError("");
                    setForgotLoading(true);
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
                    });
                    setForgotLoading(false);
                    if (error) { setError(error.message); return; }
                    setForgotSent(true);
                  }}
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {forgotLoading ? "..." : "Enviar enlace"}
                </button>
                <button
                  onClick={() => { setShowForgot(false); setError(""); }}
                  className="mt-3 text-xs text-[var(--color-text-secondary)]"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Email verification modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-overlay">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowEmailModal(false)} />
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-8 max-w-sm mx-6 text-center animate-scale-in">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Verifica tu email
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              Te enviamos un enlace de verificación a <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            <button
              onClick={() => setShowEmailModal(false)}
              className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
