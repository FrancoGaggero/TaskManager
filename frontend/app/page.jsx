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
      router.push("/projects");
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
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-3xl p-10 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Task<span className="text-[#FFB347]">Board</span>
            </h1>
            <p className="text-gray-400 text-sm">Organiza tus proyectos como un profesional</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
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
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3.5 px-6 bg-linear-to-r from-[#FFB347] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF6B35] text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-[#FFB347]/20"
            >
              Iniciar Sesión
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          <p className="mt-6 text-center text-gray-400 text-sm">
            ¿No tenés cuenta?{" "}
            <a href="/register" className="text-[#FFB347] hover:text-[#FF8C00] font-semibold transition-colors">
              Registrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}