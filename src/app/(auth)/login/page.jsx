"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Scale } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email    = "El correo es requerido";
    if (!form.password)     e.password = "La contraseña es requerida";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    const result = await signIn("credentials", {
      email:    form.email.toLowerCase().trim(),
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setServerError("Correo o contraseña incorrectos");
    } else {
      setRedirecting(true);
      router.push("/inicio");
      router.refresh();
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  if (redirecting) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", gap: "24px" }}>
        <div style={{ position: "relative", width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #e8edff" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#0e1c2b", animation: "spin 0.8s linear infinite" }} />
          <Scale style={{ width: "28px", height: "28px", color: "#0e1c2b" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "17px", fontWeight: 700, color: "#0e1c2b" }}>Bienvenido a TutelaIA</p>
          <p style={{ fontSize: "14px", color: "#9699a6", marginTop: "4px" }}>Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Heading solo en login */}
     
      <div style={{ marginBottom: "40px" }}>
         <p><br /></p>
        <h1 style={{ fontSize: "38px", fontWeight: 700, letterSpacing: "-0.02em", color: "#1A1A18", lineHeight: 1.1, marginBottom: "12px", fontFamily: "'Cormorant Garant', serif" }}>
          Bienvenido a TutelaIA
        </h1>
        <p style={{ color: "#5A5A56", fontWeight: 400, fontSize: "15px", lineHeight: 1.6 }}>
          Ingresa tus credenciales para acceder a tu espacio de trabajo.
        </p>
      </div>

      {/* Error servidor */}
      {serverError && (
        <div className="auth-server-err" role="alert">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Email */}
        <div>
          <label className="auth-label" htmlFor="email">Correo profesional</label>
          <div className="focus-field">
            <input
              id="email" name="email" type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label className="auth-label" htmlFor="password" style={{ marginBottom: 0 }}>Contraseña</label>
           
          </div>
          <div className="focus-field">
            <div style={{ position: "relative" }}>
              <input
                id="password" name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className={`auth-input auth-input-pr${errors.password ? " auth-input-err" : ""}`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9699a6", display: "flex", alignItems: "center", padding: 0 }}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword
                  ? <EyeOff style={{ width: "18px", height: "18px" }} />
                  : <Eye    style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>
            <div className="focus-bar" />
          </div>
          {errors.password && <p className="auth-field-err">{errors.password}</p>}
        </div>

        {/* Botón */}
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading
            ? <><div className="auth-spin" /> Ingresando...</>
            : <>Acceder al panel <span style={{ fontSize: "18px" }}></span></>}
        </button>
      </form>

      {/* Divisor */}
      <div style={{ marginTop: "36px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div className="auth-divider-line" />
        <span className="auth-divider-text">¿Nuevo en la plataforma?</span>
        <div className="auth-divider-line" />
      </div>

      <Link href="/register" className="auth-secondary-btn">
        Crear una cuenta
      </Link>
    </>
  );
}
