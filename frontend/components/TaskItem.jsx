"use client";
import { useState } from "react";
import PropTypes from "prop-types";

export default function TaskItem({ task, onToggle, onDelete, showToast, currentUser }) {
  const [showModal, setShowModal] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const isOwner = currentUser?.id === task.userId;
  const canEdit = isAdmin || isOwner;

  const handleToggle = async () => {
    if (!canEdit) {
      showToast("No tenés permiso para editar esta tarea", "error");
      return;
    }
    try {
      await onToggle(task.id, task.completed);
      showToast(
        task.completed ? "Tarea marcada como pendiente" : "Tarea completada",
        "success"
      );
    } catch (error) {
      showToast("Error al actualizar tarea", "error");
    }
  };

  const handleDelete = async () => {
    if (!canEdit) {
      showToast("No tenés permiso para eliminar esta tarea", "error");
      return;
    }
    try {
      await onDelete(task.id);
      setShowModal(false);
      showToast("Tarea eliminada", "success");
    } catch (error) {
      showToast("Error al eliminar tarea", "error");
    }
  };

  return (
    <>
      <li className="flex justify-between items-center bg-[#1E1E1E] p-4 rounded-xl shadow-lg border border-[#FFB347]/30 hover:border-[#FFB347]/50 hover:shadow-[#FFB347]/10 transition-all duration-200">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={!canEdit}
            className={`w-5 h-5 rounded focus:ring-2 focus:ring-[#FFB347] accent-[#FFB347] ${
              canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
          />
          <div className="flex-1">
            <span
              className={`text-lg ${
                task.completed ? "line-through text-gray-500" : "text-white"
              }`}
            >
              {task.title}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {task.userName ? `Creada por: ${task.userName}` : `Usuario ID: ${task.userId}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => canEdit ? setShowModal(true) : showToast("No tenés permiso", "error")}
          disabled={!canEdit}
          className={`px-4 py-2 rounded-xl transition duration-200 font-medium ${
            canEdit
              ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Eliminar
        </button>
      </li>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#2D2D2D] rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-[#FFB347]/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Eliminar tarea?
            </h3>
            <p className="text-gray-300 mb-8">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-[#121212] text-gray-300 border border-[#FFB347]/30 rounded-xl hover:bg-[#1A1A1A] transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium shadow-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    userId: PropTypes.number.isRequired,
    userName: PropTypes.string
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.string.isRequired
  })
};
