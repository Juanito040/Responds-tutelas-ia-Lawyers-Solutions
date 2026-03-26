// Layout para páginas de autenticación (login y registro)
import { Scale } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-primary-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-md mb-4">
            <Scale className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">TutelaIA</h1>
        
        </div>

        {/* Card de formulario */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {children}
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          Software jurídico profesional · Colombia
        </p>
      </div>
    </div>
  );
}
