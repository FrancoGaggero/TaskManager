"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function HomePage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/tasks");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Credenciales inválidas. Verifica tu email y contraseña.");
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
      <nav className="bg-[#2D2D2D] shadow-2xl border-b border-[#FFB347]/20 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-white text-2xl font-bold text-center tracking-tight">
            TaskManager <span className="text-[#FFB347]">Pro</span>
          </h1>
        </div>
      </nav>

      <div className="mt-20 w-full max-w-md">
        <div className="bg-[#2D2D2D] rounded-3xl shadow-2xl border border-[#FFB347]/30 p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Iniciar Sesión</h2>
            <p className="text-gray-300">Accede a tu cuenta para gestionar tus tareas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 border border-[#FFB347]/30 rounded-xl focus:ring-2 focus:ring-[#FFB347] focus:border-[#FFB347] transition-all duration-200 bg-[#121212] text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 border border-[#FFB347]/30 rounded-xl focus:ring-2 focus:ring-[#FFB347] focus:border-[#FFB347] transition-all duration-200 bg-[#121012] text-white placeholder-gray-400"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-4 px-6 bg-linear-to-r from-[#FFB347] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF6B35] text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-xl hover:shadow-[#FFB347]/30"
            >
              Iniciar Sesión
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-center">
              {error}
            </div>
          )}


          <p className="mt-6 text-center text-gray-300">
            ¿No tenés cuenta?{" "}
            <a href="/register" className="text-[#FFB347] hover:text-[#FF8C00] font-semibold hover:underline transition-colors">
              Registrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}