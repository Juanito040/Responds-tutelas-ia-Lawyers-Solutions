"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]               = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Mínimo 2 caracteres";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo no válido";
    if (!form.password || form.password.length < 8) e.password = "Mínimo 8 caracteres";
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
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.error?.details) setErrors(data.error.details);
        else setServerError(data.error?.message || "Error al crear la cuenta");
        setLoading(false);
        return;
      }
      await signIn("credentials", { email: form.email.toLowerCase().trim(), password: form.password, redirect: false });
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
      {/* Heading */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "34px", fontWeight: 700, letterSpacing: "-0.02em", color: "#1A1A18", lineHeight: 1.1, marginBottom: "10px", fontFamily: "'Cormorant Garant', serif" }}>
          Crear cuenta
        </h1>
        <p style={{ color: "#5A5A56", fontWeight: 400, fontSize: "15px", lineHeight: 1.6 }}>
          Únete a TutelaIA y gestiona tus tutelas con IA.
        </p>
      </div>

      {serverError && (
        <div className="auth-server-err" role="alert">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Nombre */}
        <div>
          <label className="auth-label" htmlFor="name">Nombre completo</label>
          <div className="focus-field">
            <input
              id="name" name="name" type="text" autoComplete="name"
              value={form.name} onChange={handleChange}
              className={`auth-input${errors.name ? " auth-input-err" : ""}`}
              placeholder="Dra. María Rodríguez"
              disabled={loading}
            />
            <div className="focus-bar" />
          </div>
          {errors.name && <p className="auth-field-err">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="auth-label" htmlFor="email">Correo profesional</label>
          <div className="focus-field">
            <input
              id="email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={handleChange}
              className={`auth-input${errors.email ? " auth-input-err" : ""}`}
              placeholder="abogado@estudio.com"
              disabled={loading}
            />
            <div className="focus-bar" />
          </div>
          {errors.email && <p className="auth-field-err">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="auth-label" htmlFor="password">Contraseña</label>
          <div className="focus-field">
            <div style={{ position: "relative" }}>
              <input
                id="password" name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password} onChange={handleChange}
                className={`auth-input auth-input-pr${errors.password ? " auth-input-err" : ""}`}
                placeholder="Mínimo 8 caracteres y un número"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9699a6", display: "flex", alignItems: "center", padding: 0 }}
                aria-label={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>
            <div className="focus-bar" />
          </div>
          {form.password && <PasswordStrengthBar strength={passwordStrength} />}
          {errors.password && <p className="auth-field-err">{errors.password}</p>}
        </div>

        {/* Confirmar */}
        <div>
          <label className="auth-label" htmlFor="confirm">Confirmar contraseña</label>
          <div className="focus-field">
            <input
              id="confirm" name="confirm" type="password" autoComplete="new-password"
              value={form.confirm} onChange={handleChange}
              className={`auth-input${errors.confirm ? " auth-input-err" : ""}`}
              placeholder="Repite tu contraseña"
              disabled={loading}
            />
            <div className="focus-bar" />
          </div>
          {form.confirm && form.confirm === form.password && (
            <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px" }}>✓ Las contraseñas coinciden</p>
          )}
          {errors.confirm && <p className="auth-field-err">{errors.confirm}</p>}
        </div>

        {/* Botón */}
        <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: "8px" }}>
          {loading
            ? <><div className="auth-spin" /> Creando cuenta...</>
            : <>Crear cuenta <span style={{ fontSize: "18px" }}></span></>}
        </button>
      </form>

      {/* Divisor */}
      <div style={{ marginTop: "28px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div className="auth-divider-line" />
        <span className="auth-divider-text">¿Ya tienes cuenta?</span>
        <div className="auth-divider-line" />
      </div>

      <Link href="/login" className="auth-secondary-btn">
        Iniciar sesión
      </Link>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)           score++;
  if (password.length >= 12)          score++;
  if (/\d/.test(password))            score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

function PasswordStrengthBar({ strength }) {
  const levels = ["", "Muy débil", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#3b82f6", "#22c55e"];
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ height: "4px", flex: 1, borderRadius: "9999px", background: i <= strength ? colors[strength] : "#e8edff", transition: "background 0.3s" }} />
        ))}
      </div>
      {strength > 0 && <p style={{ fontSize: "12px", color: "#9699a6", marginTop: "4px" }}>{levels[strength]}</p>}
    </div>
  );
}
