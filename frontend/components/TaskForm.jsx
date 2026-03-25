"use client";
import { useState } from "react";
import PropTypes from "prop-types";
import VoiceInput from "./VoiceInput";

export default function TaskForm({ onAddTask, showToast }) {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("El título no puede estar vacío", "error");
      return;
    }
    try {
      await onAddTask(title);
      setTitle("");
      showToast("Tarea agregada exitosamente", "success");
    } catch (error) {
      showToast("Error al agregar tarea", "error");
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setTitle(transcript);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Escribe tu tarea aquí... o usa el micrófono"
        className="flex-1 px-4 py-3 border border-[#FFB347]/30 rounded-xl focus:ring-2 focus:ring-[#FFB347] focus:border-[#FFB347] transition-all duration-200 bg-[#121212] text-white placeholder-gray-400 outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <VoiceInput 
        onTranscript={handleVoiceTranscript}
        showToast={showToast}
      />
      <button
        type="submit"
        className="px-6 py-3 bg-linear-to-r from-[#FFB347] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF6B35] text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-xl hover:shadow-[#FFB347]/30 whitespace-nowrap"
      >
        Agregar
      </button>
    </form>
  );
}

TaskForm.propTypes = {
  onAddTask: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired
};