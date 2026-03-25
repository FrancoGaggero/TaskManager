"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../../lib/api";
import Toast from "../../components/Toast";

export default function AdminPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  
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
      setTimeout(() => router.push("/projects"), 2000);
    } else {
      fetchUsers();
      fetchAllProjects();
    }
  }, [isAuthenticated, user]);

  const showToast = (message, type) => setToast({ message, type });

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get("/auth/users");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      showToast("Error al cargar usuarios", "error");
    }
  };

  const fetchAllProjects = async () => {
    try {
      const data = await apiClient.get("/projects/admin/all");
      setAllProjects(data.projects || []);
    } catch (error) {
      showToast("Error al cargar proyectos", "error");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/auth/create-user", formData);
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
      fetchAllProjects();
    } catch (error) {
      showToast("Error al eliminar usuario", "error");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getTotalTasks = (project) => {
    return project.columns?.reduce((sum, col) => sum + (col._count?.tasks || 0), 0) || 0;
  };

  // Group projects by user for cleaner display
  const projectsByUser = allProjects.reduce((acc, project) => {
    const userName = project.user?.name || "Desconocido";
    const userEmail = project.user?.email || "";
    const key = project.user?.id || "unknown";
    if (!acc[key]) acc[key] = { name: userName, email: userEmail, projects: [] };
    acc[key].projects.push(project);
    return acc;
  }, {});

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-mesh">
      {/* Nav */}
      <nav className="glass-strong sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/projects")}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <h1 className="text-white text-xl font-bold">
                Panel <span className="text-[#FFB347]">Admin</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/projects")}
                className="text-gray-300 text-sm font-medium px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                Mis Proyectos
              </button>
              <button
                onClick={handleLogout}
                className="text-red-400 text-sm font-medium px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "users"
                  ? "bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/30"
                  : "text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              Usuarios ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "projects"
                  ? "bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/30"
                  : "text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              Todos los Proyectos ({allProjects.length})
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 bg-linear-to-r from-[#FFB347] to-[#FF8C00] text-black font-semibold rounded-xl transition-all hover:scale-[1.02] text-sm"
                >
                  + Crear Usuario
                </button>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB347] uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB347] uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#FFB347] uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-[#FFB347] uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white text-sm font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin" 
                              ? "bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/30" 
                              : "bg-white/5 text-gray-300 border border-white/10"
                          }`}>
                            {u.role === "admin" ? "Admin" : "Usuario"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === user.id}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              u.id === user.id
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
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
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-2xl font-bold text-white">
                Proyectos de todos los usuarios
                <span className="text-sm font-normal text-gray-400 ml-2">(solo lectura)</span>
              </h2>

              {Object.entries(projectsByUser).map(([userId, userData]) => (
                <div key={userId} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFB347]/20 flex items-center justify-center text-[#FFB347] text-sm font-bold">
                      {userData.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{userData.name}</h3>
                      <p className="text-gray-500 text-xs">{userData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-11">
                    {userData.projects.map((project) => (
                      <div
                        key={project.id}
                        className="glass-card rounded-xl p-5 cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <h4 className="text-white font-medium text-sm mb-2 truncate">
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{project.columns?.length || 0} columnas</span>
                          <span>{getTotalTasks(project)} tareas</span>
                        </div>
                        <div className="flex gap-1 mt-3">
                          {project.columns?.map((col) => (
                            <div key={col.id} className="h-1 flex-1 rounded-full bg-[#FFB347]/20">
                              <div
                                className="h-full rounded-full bg-[#FFB347]/50"
                                style={{ width: col._count?.tasks > 0 ? '100%' : '0%' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {allProjects.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-gray-400">No hay proyectos en el sistema</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-6">
              Crear <span className="text-[#FFB347]">Usuario</span>
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
                  placeholder="usuario@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#FFB347]/50 cursor-pointer"
                >
                  <option value="usuario" className="bg-[#1a1a2e]">Usuario</option>
                  <option value="admin" className="bg-[#1a1a2e]">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-linear-to-r from-[#FFB347] to-[#FF8C00] text-black rounded-xl font-semibold transition-all hover:scale-[1.02] text-sm"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
