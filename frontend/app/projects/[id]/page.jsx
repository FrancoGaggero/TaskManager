"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../../lib/api";
import Toast from "../../../components/Toast";

export default function ProjectBoardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [toast, setToast] = useState(null);
  const [newTaskInputs, setNewTaskInputs] = useState({});
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [editingColumn, setEditingColumn] = useState(null);
  const [editColumnName, setEditColumnName] = useState("");
  const [deleteColumnTarget, setDeleteColumnTarget] = useState(null);

  // Drag state
  const dragState = useRef({
    taskId: null,
    sourceColumnId: null,
    dragElement: null,
  });
  const [dropTarget, setDropTarget] = useState({ columnId: null, insertIndex: null });
  const [isDragging, setIsDragging] = useState(false);

  const isOwner = project?.userId === user?.id;
  const isReadOnly = !isOwner;

  const showToast = (message, type) => setToast({ message, type });

  const fetchProject = useCallback(async () => {
    try {
      const data = await apiClient.get(`/projects/${projectId}`);
      setProject(data);
    } catch (error) {
      showToast("Error al cargar el proyecto", "error");
      router.push("/projects");
    }
  }, [projectId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else {
      fetchProject();
    }
  }, [isAuthenticated, fetchProject]);

  // Task CRUD
  const handleAddTask = async (columnId) => {
    const title = newTaskInputs[columnId]?.trim();
    if (!title) return;
    try {
      await apiClient.post(`/columns/${columnId}/tasks`, { title });
      setNewTaskInputs({ ...newTaskInputs, [columnId]: "" });
      fetchProject();
    } catch (error) {
      showToast("Error al crear tarea", "error");
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      // Optimistic update
      setProject(prev => ({
        ...prev,
        columns: prev.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t)
        }))
      }));
      await apiClient.put(`/columns/tasks/${taskId}`, { completed: !completed });
    } catch (error) {
      showToast("Error al actualizar tarea", "error");
      fetchProject();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.delete(`/columns/tasks/${taskId}`);
      fetchProject();
      showToast("Tarea eliminada", "success");
    } catch (error) {
      showToast("Error al eliminar tarea", "error");
    }
  };

  // Column CRUD
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    try {
      await apiClient.post(`/columns/project/${projectId}`, { name: newColumnName });
      setNewColumnName("");
      setShowAddColumn(false);
      fetchProject();
      showToast("Columna creada", "success");
    } catch (error) {
      showToast("Error al crear columna", "error");
    }
  };

  const handleEditColumn = async (e) => {
    e.preventDefault();
    if (!editColumnName.trim() || !editingColumn) return;
    try {
      await apiClient.put(`/columns/${editingColumn}`, { name: editColumnName });
      setEditingColumn(null);
      setEditColumnName("");
      fetchProject();
    } catch (error) {
      showToast("Error al actualizar columna", "error");
    }
  };

  const handleDeleteColumn = async () => {
    if (!deleteColumnTarget) return;
    try {
      await apiClient.delete(`/columns/${deleteColumnTarget}`);
      setDeleteColumnTarget(null);
      fetchProject();
      showToast("Columna eliminada", "success");
    } catch (error) {
      showToast("Error al eliminar columna", "error");
    }
  };

  // Drag & Drop — completely rewritten for reliability
  const handleDragStart = (e, task, sourceColumnId) => {
    // Prevent drag from checkboxes and buttons
    if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") {
      e.preventDefault();
      return;
    }
    dragState.current = { taskId: task.id, sourceColumnId, dragElement: e.target };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);

    // Slight delay so the browser captures the element before we style it
    requestAnimationFrame(() => {
      if (dragState.current.dragElement) {
        dragState.current.dragElement.style.opacity = "0.3";
      }
    });
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    if (dragState.current.dragElement) {
      dragState.current.dragElement.style.opacity = "1";
    }
    dragState.current = { taskId: null, sourceColumnId: null, dragElement: null };
    setDropTarget({ columnId: null, insertIndex: null });
    setIsDragging(false);
  };

  // Compute insert index by comparing cursor Y to the midpoints of task elements
  const computeInsertIndex = (e, columnEl, columnId) => {
    const taskEls = columnEl.querySelectorAll("[data-task-id]");
    if (taskEls.length === 0) return 0;

    for (let i = 0; i < taskEls.length; i++) {
      // Skip the dragged task itself
      if (taskEls[i].dataset.taskId === dragState.current.taskId) continue;
      const rect = taskEls[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        return i;
      }
    }
    return taskEls.length;
  };

  const handleColumnDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragState.current.taskId) return;
    const columnEl = e.currentTarget;
    const insertIndex = computeInsertIndex(e, columnEl, columnId);
    setDropTarget({ columnId, insertIndex });
  };

  const handleColumnDragLeave = (e) => {
    // Only reset if we actually left the column (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget({ columnId: null, insertIndex: null });
    }
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    const { taskId, sourceColumnId } = dragState.current;
    if (!taskId) return;

    const insertIndex = dropTarget.insertIndex ?? 0;

    // Optimistic UI update — move the task locally before API call
    setProject(prev => {
      if (!prev) return prev;
      const newColumns = prev.columns.map(col => ({ ...col, tasks: [...col.tasks] }));

      const sourceCol = newColumns.find(c => c.id === sourceColumnId);
      const targetCol = newColumns.find(c => c.id === targetColumnId);
      if (!sourceCol || !targetCol) return prev;

      // Remove from source
      const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;
      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

      // Adjust insert index if same column and we removed before the target
      let adjustedIndex = insertIndex;
      if (sourceColumnId === targetColumnId && taskIndex < insertIndex) {
        adjustedIndex = Math.max(0, insertIndex - 1);
      }

      // Insert into target
      movedTask.columnId = targetColumnId;
      targetCol.tasks.splice(adjustedIndex, 0, movedTask);

      // Update orders
      sourceCol.tasks.forEach((t, i) => { t.order = i; });
      if (sourceColumnId !== targetColumnId) {
        targetCol.tasks.forEach((t, i) => { t.order = i; });
      }

      return { ...prev, columns: newColumns };
    });

    // Reset drag state
    handleDragEnd();

    // Send to backend — single API call handles full reorder
    try {
      // Compute the real insert position (accounting for same-column adjustment)
      let apiOrder = insertIndex;
      if (sourceColumnId === targetColumnId) {
        const col = project.columns.find(c => c.id === sourceColumnId);
        const oldIndex = col?.tasks.findIndex(t => t.id === taskId) ?? 0;
        if (oldIndex < insertIndex) {
          apiOrder = Math.max(0, insertIndex - 1);
        }
      }
      await apiClient.put(`/columns/tasks/${taskId}/move`, {
        targetColumnId,
        order: apiOrder
      });
    } catch (error) {
      showToast("Error al mover tarea", "error");
      fetchProject(); // Revert on error
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated || !project) return null;

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Navigation */}
      <nav className="glass-strong sticky top-0 z-50 shrink-0">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/projects")}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                <h1 className="text-white text-lg font-bold">{project.name}</h1>
                {isReadOnly && (
                  <span className="text-xs text-amber-400/80 font-medium">Solo lectura</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm hidden sm:block">{user?.name}</span>
              {user?.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="text-[#FFB347] text-sm font-medium px-3 py-1.5 rounded-lg bg-[#FFB347]/10 border border-[#FFB347]/20 hover:bg-[#FFB347]/20 transition-all"
                >
                  Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-5 h-full min-h-[calc(100vh-80px)]">
          {project.columns?.map((column) => (
            <div
              key={column.id}
              className={`w-80 shrink-0 flex flex-col rounded-2xl glass ${
                isDragging && dropTarget.columnId === column.id ? "border-[#FFB347]/40 shadow-[0_0_30px_rgba(255,179,71,0.15)]" : ""
              } transition-all duration-200`}
              onDragOver={(e) => handleColumnDragOver(e, column.id)}
              onDragLeave={handleColumnDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-4 flex justify-between items-center border-b border-white/5">
                {editingColumn === column.id ? (
                  <form onSubmit={handleEditColumn} className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editColumnName}
                      onChange={(e) => setEditColumnName(e.target.value)}
                      autoFocus
                      onBlur={() => setEditingColumn(null)}
                      className="flex-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#FFB347]/50"
                    />
                  </form>
                ) : (
                  <h3
                    className={`text-white font-semibold text-sm uppercase tracking-wide ${!isReadOnly ? "cursor-pointer hover:text-[#FFB347]" : ""} transition-colors`}
                    onClick={() => {
                      if (!isReadOnly) {
                        setEditingColumn(column.id);
                        setEditColumnName(column.name);
                      }
                    }}
                  >
                    {column.name}
                    <span className="ml-2 text-gray-500 font-normal text-xs">
                      {column.tasks?.length || 0}
                    </span>
                  </h3>
                )}
                {!isReadOnly && (
                  <button
                    onClick={() => setDeleteColumnTarget(column.id)}
                    className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
              </div>

              {/* Tasks */}
              <div className="flex-1 p-3 space-y-0 overflow-y-auto column-scroll min-h-[100px]">
                {column.tasks?.map((task, index) => (
                  <div key={task.id}>
                    {/* Drop indicator line — shows above this task */}
                    {isDragging && dropTarget.columnId === column.id && dropTarget.insertIndex === index && dragState.current.taskId !== task.id && (
                      <div className="h-1 bg-[#FFB347] rounded-full mx-2 my-1 transition-all" />
                    )}
                    <div
                      data-task-id={task.id}
                      draggable={!isReadOnly}
                      onDragStart={(e) => handleDragStart(e, task, column.id)}
                      onDragEnd={handleDragEnd}
                      className={`glass-card rounded-xl p-3 my-1.5 select-none ${
                        !isReadOnly ? "cursor-grab active:cursor-grabbing" : ""
                      } ${
                        dragState.current.taskId === task.id ? "opacity-30" : ""
                      } transition-opacity duration-150`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (!isReadOnly) handleToggleTask(task.id, task.completed);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          draggable={false}
                          disabled={isReadOnly}
                          className="mt-1 w-4 h-4 rounded accent-[#FFB347] cursor-pointer shrink-0"
                        />
                        <span className={`text-sm flex-1 ${
                          task.completed ? "line-through text-gray-500" : "text-gray-200"
                        }`}>
                          {task.title}
                        </span>
                        {!isReadOnly && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            onMouseDown={(e) => e.stopPropagation()}
                            draggable={false}
                            className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Drop indicator at the end of the list */}
                {isDragging && dropTarget.columnId === column.id && dropTarget.insertIndex === (column.tasks?.length || 0) && (
                  <div className="h-1 bg-[#FFB347] rounded-full mx-2 my-1 transition-all" />
                )}

                {/* Drop zone indicator when column is empty */}
                {column.tasks?.length === 0 && isDragging && dropTarget.columnId === column.id && (
                  <div className="border-2 border-dashed border-[#FFB347]/30 rounded-xl p-4 text-center">
                    <span className="text-xs text-[#FFB347]/50">Soltar aquí</span>
                  </div>
                )}
              </div>

              {/* Add Task */}
              {!isReadOnly && (
                <div className="p-3 border-t border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva tarea..."
                      value={newTaskInputs[column.id] || ""}
                      onChange={(e) => setNewTaskInputs({ ...newTaskInputs, [column.id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(column.id); }}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 outline-none focus:border-[#FFB347]/30 transition-all"
                    />
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="px-3 py-2 rounded-lg bg-[#FFB347]/10 text-[#FFB347] text-sm font-medium hover:bg-[#FFB347]/20 transition-all border border-[#FFB347]/20"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Column */}
          {!isReadOnly && (
            <div className="w-80 shrink-0">
              {showAddColumn ? (
                <div className="glass rounded-2xl p-4 animate-fade-in">
                  <form onSubmit={handleAddColumn} className="space-y-3">
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Nombre de la columna"
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 outline-none focus:border-[#FFB347]/30 transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-linear-to-r from-[#FFB347] to-[#FF8C00] text-black rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
                      >
                        Crear
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddColumn(false); setNewColumnName(""); }}
                        className="px-3 py-2 rounded-lg text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-500 hover:text-[#FFB347] hover:border-[#FFB347]/30 transition-all text-sm font-medium"
                >
                  + Agregar columna
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Column Confirmation */}
      {deleteColumnTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-3">¿Eliminar columna?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Se eliminarán todas las tareas de esta columna.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteColumnTarget(null)}
                className="px-5 py-2.5 rounded-xl text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteColumn}
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
