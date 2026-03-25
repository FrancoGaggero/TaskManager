"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error en el registro. Intenta con otro email.");
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-3xl p-10 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Task<span className="text-[#FFB347]">Board</span>
            </h1>
            <p className="text-gray-400 text-sm">Crea tu cuenta para empezar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3.5 px-6 bg-linear-to-r from-[#FFB347] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF6B35] text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-[#FFB347]/20"
            >
              Registrarse
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-center text-sm">
              ¡Registro exitoso! Redirigiendo al login...
            </div>
          )}

          <p className="mt-6 text-center text-gray-400 text-sm">
            ¿Ya tenés cuenta?{" "}
            <a href="/" className="text-[#FFB347] hover:text-[#FF8C00] font-semibold transition-colors">
              Iniciá sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}