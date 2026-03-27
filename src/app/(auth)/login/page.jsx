"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2, Scale } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading]       = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim())    e.email    = "El correo es requerido";
    if (!form.password)        e.password = "La contraseña es requerida";
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
      // Mensaje genérico — no revelar si el correo existe (security-audit)
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-6">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin" />
          <Scale className="w-8 h-8 text-primary-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-primary-700">Bienvenido a TutelaIA</p>
          <p className="text-sm text-muted mt-1">Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold text-primary-500 mb-1">Iniciar sesión</h2>
      <p className="text-sm text-muted mb-6">Accede a tus casos de tutela</p>

      {serverError && (
        <div className="alert alert-error mb-4" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="mb-4">
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : "input"}
            placeholder="abogada@estudio.com"
            disabled={loading}
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div className="mb-6">
          <label className="label" htmlFor="password">Contraseña</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={`${errors.password ? "input-error" : "input"} pr-10`}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary-500"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="error-msg">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary w-full btn-lg"
          disabled={loading}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</>
            : <><LogIn className="w-4 h-4" /> Ingresar</>
          }
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-accent-500 font-medium hover:underline">
          Regístrate
        </Link>
      </p>
    </>
  );
}
