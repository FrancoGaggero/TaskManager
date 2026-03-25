"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../../lib/api";
import TaskForm from "../../components/TaskForm";
import DraggableTaskItem from "./DraggableTaskItem";
import Toast from "../../components/Toast";
import TypewriterText from "../../components/TypewriterText";
import FloatingAnimation from "../../components/FloatingAnimation";

export default function TasksPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [toast, setToast] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else {
      fetchTasks();
    }
  }, [isAuthenticated]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const fetchTasks = async () => {
    try {
      const data = await apiClient.get("/tasks");
      // El backend devuelve { count, tasks }
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (error) {
      setTasks([]);
      showToast("Error al cargar tareas", "error");
    }
  };

  const addTask = async (title) => {
    try {
      await apiClient.post("/tasks", { title, userId: user.id });
      await fetchTasks();
    } catch (error) {
      throw new Error("Error al agregar tarea");
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await apiClient.put(`/tasks/${taskId}`, { 
        completed: !completed, 
        userId: user.id 
      });
      fetchTasks();
    } catch (error) {
      showToast("Error al actualizar tarea", "error");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await apiClient.delete(`/tasks/${taskId}?userId=${user.id}`);
      fetchTasks();
    } catch (error) {
      showToast("Error al eliminar tarea", "error");
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);
    
    setTasks(newTasks);
    setDraggedIndex(null);
    
    showToast("Tarea reordenada", "success");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <nav className="bg-[#2D2D2D] shadow-2xl border-b border-[#FFB347]/20 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold tracking-tight">
              <TypewriterText text="TaskManager Pro" blueText="Pro" />
            </h1>
            <div className="flex gap-3">
              {user?.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="bg-[#FFB347] text-black px-6 py-2 rounded-xl font-semibold hover:bg-[#FF8C00] transition duration-200 shadow-lg hover:shadow-[#FFB347]/30"
                >
                  Panel Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-600 transition duration-200 shadow-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2D2D2D] rounded-3xl p-10 mb-8 shadow-2xl border border-[#FFB347]/30">
            <div className="text-center">
              <FloatingAnimation delay={3000}>
                <h2 className="text-4xl font-bold text-white mb-4">
                  {user?.role === "admin" ? "Administrar Tareas" : "Mis Tareas"}
                </h2>
              </FloatingAnimation>
              <p className="text-gray-300 text-lg mb-4">
                Bienvenido, <span className="text-[#FFB347] font-semibold">{user?.name}</span>
              </p>
              <span className="inline-block bg-[#FFB347]/20 text-[#FFB347] px-4 py-2 rounded-full text-sm font-semibold border border-[#FFB347]/40">
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </span>
              <p className="text-white text-lg font-semibold bg-linear-to-r from-[#FFB347]/20 to-[#FF8C00]/20 rounded-xl py-3 px-6 inline-block border border-[#FFB347]/40 mt-4">
                Total de tareas: {tasks.length}
              </p>
            </div>
          </div>

          <div className="bg-[#2D2D2D] rounded-3xl p-8 mb-8 shadow-2xl border border-[#FFB347]/30">
            <h3 className="text-xl font-bold text-white mb-6">Nueva Tarea</h3>
            <TaskForm onAddTask={addTask} showToast={showToast} />
          </div>

          <div className="bg-[#2D2D2D] rounded-3xl p-8 shadow-2xl border border-[#FFB347]/30">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span>Mis Tareas</span>
              <span className="text-sm text-gray-400 font-normal">(Arrastra para reordenar)</span>
            </h3>
            <div className="bg-linear-to-br from-[#121212] to-[#0D0D0D] rounded-2xl p-6 min-h-[300px] max-h-[500px] overflow-y-auto border border-[#FFB347]/30 shadow-inner">
              {tasks.length === 0 ? (
                <p className="text-gray-400 text-center py-12 text-lg">
                  No hay tareas. ¡Agrega una para comenzar!
                </p>
              ) : (
                <ul className="space-y-3">
                  {tasks.map((task, index) => (
                    <DraggableTaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      showToast={showToast}
                      currentUser={user}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

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