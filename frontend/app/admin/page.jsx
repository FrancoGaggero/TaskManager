"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../../lib/api";
import Toast from "../../components/Toast";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "usuario"
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (user?.role !== "admin") {
      setToast({ message: "No tenés permisos de administrador", type: "error" });
      setTimeout(() => router.push("/tasks"), 2000);
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get("/auth/users");
      // El backend devuelve { count, users }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      showToast("Error al cargar usuarios", "error");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/auth/register", formData);
      showToast("Usuario creado exitosamente", "success");
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "usuario" });
      fetchUsers();
    } catch (error) {
      showToast("Error al crear usuario", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      showToast("No podés eliminar tu propio usuario", "error");
      return;
    }
    
    try {
      await apiClient.delete(`/auth/users/${userId}`);
      showToast("Usuario eliminado", "success");
      fetchUsers();
    } catch (error) {
      showToast("Error al eliminar usuario", "error");
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <nav className="bg-[#2D2D2D] shadow-2xl border-b border-[#FFB347]/20 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold tracking-tight">
              TaskManager <span className="text-[#FFB347]">Pro</span>
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/tasks")}
                className="bg-[#2D2D2D] text-[#FFB347] border border-[#FFB347]/50 px-6 py-2 rounded-xl font-semibold hover:bg-[#1A1A1A] transition duration-200 shadow-lg"
              >
                Ver Tareas
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-linear-to-r from-[#FFB347] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF6B35] text-black px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-xl hover:shadow-[#FFB347]/30"
              >
                + Crear Usuario
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#2D2D2D] rounded-3xl p-10 mb-8 shadow-2xl border border-[#FFB347]/30">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Panel de <span className="text-[#FFB347]">Administración</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Gestión de usuarios del sistema
              </p>
            </div>
          </div>

          <div className="bg-[#2D2D2D] rounded-3xl shadow-2xl border border-[#FFB347]/30 overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Lista de Usuarios</h3>
              <div className="bg-[#121212] rounded-2xl overflow-hidden border border-[#FFB347]/20">
                <table className="w-full">
                  <thead className="bg-[#1A1A1A] border-b border-[#FFB347]/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#FFB347]">Nombre</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#FFB347]">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#FFB347]">Rol</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#FFB347]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FFB347]/10">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#1A1A1A] transition-colors duration-200">
                        <td className="px-6 py-4 text-white font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-gray-300">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                            u.role === "admin" 
                              ? "bg-linear-to-r from-[#FFB347] to-[#FF8C00] text-black" 
                              : "bg-[#2D2D2D] text-[#FFB347] border border-[#FFB347]/50"
                          }`}>
                            {u.role === "admin" ? "Administrador" : "Usuario"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === user.id}
                            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                              u.id === user.id
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-red-500/30"
                            }`}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D2D2D] rounded-3xl p-10 max-w-md w-full shadow-2xl border border-[#FFB347]/30 transform transition-all">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">
              Crear Nuevo <span className="text-[#FFB347]">Usuario</span>
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#FFB347]/30 rounded-xl focus:ring-2 focus:ring-[#FFB347] focus:border-[#FFB347] transition-all duration-200 bg-[#121212] text-white placeholder-gray-400 outline-none"
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#FFB347]/30 rounded-xl focus:ring-2 focus:ring-[#FFB347] focus:border-[#FFB347] transition-all duration-200 bg-[#121212] text-white placeholder-gray-400 outline-none"
                  placeholder="usuario@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#FFB347]/30 rounded-xl focus:ring-2 focus:ring-[#FFB347] focus:border-[#FFB347] transition-all duration-200 bg-[#121212] text-white placeholder-gray-400 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-[#FFB347]/30 rounded-xl focus:ring-2 focus:ring-[#FFB347] focus:border-[#FFB347] transition-all duration-200 bg-[#121212] text-white outline-none cursor-pointer"
                >
                  <option value="usuario" className="bg-[#2D2D2D]">Usuario</option>
                  <option value="admin" className="bg-[#2D2D2D]">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-[#121212] text-gray-300 border border-[#FFB347]/30 rounded-xl hover:bg-[#1A1A1A] transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-linear-to-r from-[#FFB347] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF6B35] text-black rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-xl hover:shadow-[#FFB347]/30 font-semibold"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
