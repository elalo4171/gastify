"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-accent)]">
            Gastify
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Nueva contraseña
          </p>
        </div>

        {success ? (
          <div className="text-center animate-fade-in">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Contraseña actualizada
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Redirigiendo al dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
              {loading ? "..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
