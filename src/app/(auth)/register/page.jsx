"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Indicador de fortaleza de contraseña — frontend-quality
  const passwordStrength = getPasswordStrength(form.password);

  function validate() {
    const e = {};
    if (!form.name.trim())        e.name     = "El nombre es requerido";
    if (form.name.trim().length < 2) e.name  = "Mínimo 2 caracteres";
    if (!form.email.trim())       e.email    = "El correo es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo no válido";
    if (!form.password)           e.password = "La contraseña es requerida";
    if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (!/\d/.test(form.password)) e.password = "Debe contener al menos un número";
    if (form.password !== form.confirm) e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.error?.details) {
          setErrors(data.error.details);
        } else {
          setServerError(data.error?.message || "Error al crear la cuenta");
        }
        setLoading(false);
        return;
      }

      // Registro exitoso → login automático
      await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      });

      router.push("/dashboard");
      router.refresh();

    } catch {
      setServerError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  return (
    <>
      <h2 className="text-xl font-bold text-primary-500 mb-1">Crear cuenta</h2>
      <p className="text-sm text-muted mb-6">Únete a TutelaIA</p>

      {serverError && (
        <div className="alert alert-error mb-4" role="alert">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Nombre */}
        <div className="mb-4">
          <label className="label" htmlFor="name">Nombre completo</label>
          <input
            id="name" name="name" type="text" autoComplete="name"
            value={form.name} onChange={handleChange}
            className={errors.name ? "input-error" : "input"}
            placeholder="Dra. María Rodríguez"
            disabled={loading}
          />
          {errors.name && <p className="error-msg">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input
            id="email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={handleChange}
            className={errors.email ? "input-error" : "input"}
            placeholder="abogada@estudio.com"
            disabled={loading}
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div className="mb-4">
          <label className="label" htmlFor="password">Contraseña</label>
          <div className="relative">
            <input
              id="password" name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password} onChange={handleChange}
              className={`${errors.password ? "input-error" : "input"} pr-10`}
              placeholder="Mínimo 8 caracteres y un número"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary-500"
              aria-label={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password && (
            <PasswordStrengthBar strength={passwordStrength} />
          )}
          {errors.password && <p className="error-msg">{errors.password}</p>}
        </div>

        {/* Confirmar contraseña */}
        <div className="mb-6">
          <label className="label" htmlFor="confirm">Confirmar contraseña</label>
          <input
            id="confirm" name="confirm" type="password" autoComplete="new-password"
            value={form.confirm} onChange={handleChange}
            className={errors.confirm ? "input-error" : "input"}
            placeholder="Repite tu contraseña"
            disabled={loading}
          />
          {form.confirm && form.confirm === form.password && (
            <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Las contraseñas coinciden
            </p>
          )}
          {errors.confirm && <p className="error-msg">{errors.confirm}</p>}
        </div>

        <button type="submit" className="btn-primary w-full btn-lg" disabled={loading}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</>
            : <><UserPlus className="w-4 h-4" /> Crear cuenta</>
          }
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent-500 font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/\d/.test(password))   score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

function PasswordStrengthBar({ strength }) {
  const levels = ["", "Muy débil", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-xs text-muted mt-1">{levels[strength]}</p>
      )}
    </div>
  );
}
