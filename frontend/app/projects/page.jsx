"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../../lib/api";
import Toast from "../../components/Toast";

export default function ProjectsPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const showToast = (message, type) => setToast({ message, type });

  const fetchProjects = async () => {
    try {
      const data = await apiClient.get("/projects");
      setProjects(data.projects || []);
    } catch (error) {
      showToast("Error al cargar proyectos", "error");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await apiClient.post("/projects", { name: newProjectName });
      setNewProjectName("");
      setShowModal(false);
      fetchProjects();
      showToast("Proyecto creado exitosamente", "success");
    } catch (error) {
      showToast("Error al crear proyecto", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/projects/${deleteTarget}`);
      setDeleteTarget(null);
      fetchProjects();
      showToast("Proyecto eliminado", "success");
    } catch (error) {
      showToast("Error al eliminar proyecto", "error");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editTarget) return;
    try {
      await apiClient.put(`/projects/${editTarget}`, { name: editName });
      setEditTarget(null);
      setEditName("");
      fetchProjects();
      showToast("Proyecto actualizado", "success");
    } catch (error) {
      showToast("Error al actualizar proyecto", "error");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getTotalTasks = (project) => {
    return project.columns?.reduce((sum, col) => sum + (col._count?.tasks || 0), 0) || 0;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-mesh">
      {/* Navigation */}
      <nav className="glass-strong sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-xl font-bold tracking-tight">
              Task<span className="text-[#FFB347]">Board</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm hidden sm:block">
                {user?.name}
              </span>
              {user?.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="text-[#FFB347] text-sm font-medium px-4 py-2 rounded-lg bg-[#FFB347]/10 border border-[#FFB347]/20 hover:bg-[#FFB347]/20 transition-all"
                >
                  Admin
                </button>
              )}
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

      {/* Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Mis Proyectos
              </h2>
              <p className="text-gray-400 mt-1">
                {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-linear-to-r from-[#FFB347] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF6B35] text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-[#FFB347]/20 text-sm"
            >
              + Nuevo Proyecto
            </button>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center animate-fade-in">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No tenés proyectos todavía
              </h3>
              <p className="text-gray-400 mb-6">
                Creá tu primer proyecto para empezar a organizar tus tareas
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-linear-to-r from-[#FFB347] to-[#FF8C00] text-black font-semibold rounded-xl transition-all hover:scale-[1.02]"
              >
                Crear Proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="glass-card rounded-2xl p-6 cursor-pointer animate-fade-in group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#FFB347] transition-colors truncate mr-2">
                      {project.name}
                    </h3>
                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditTarget(project.id); setEditName(project.name); }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#FFB347] hover:bg-white/5 transition-all"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(project.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{project.columns?.length || 0} columnas</span>
                    <span>{getTotalTasks(project)} tareas</span>
                  </div>

                  {/* Column indicators */}
                  <div className="flex gap-1.5 mt-4">
                    {project.columns?.map((col) => (
                      <div
                        key={col.id}
                        className="h-1.5 flex-1 rounded-full bg-[#FFB347]/20"
                        title={`${col.name}: ${col._count?.tasks || 0} tareas`}
                      >
                        <div
                          className="h-full rounded-full bg-[#FFB347]/60"
                          style={{ width: col._count?.tasks > 0 ? '100%' : '0%' }}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(project.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-6">
              Nuevo <span className="text-[#FFB347]">Proyecto</span>
            </h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del proyecto</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Mi nuevo proyecto"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Se crearán 3 columnas por defecto: Por Hacer, En Progreso, Completado
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setNewProjectName(""); }}
                  className="px-5 py-2.5 rounded-xl text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-linear-to-r from-[#FFB347] to-[#FF8C00] text-black rounded-xl font-semibold transition-all hover:scale-[1.02] text-sm"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-6">
              Editar <span className="text-[#FFB347]">Proyecto</span>
            </h3>
            <form onSubmit={handleEdit} className="space-y-5">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFB347]/50 focus:ring-1 focus:ring-[#FFB347]/30 transition-all outline-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-5 py-2.5 rounded-xl text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-linear-to-r from-[#FFB347] to-[#FF8C00] text-black rounded-xl font-semibold transition-all hover:scale-[1.02] text-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-3">¿Eliminar proyecto?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Se eliminarán todas las columnas y tareas asociadas. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
