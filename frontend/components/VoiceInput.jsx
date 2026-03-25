"use client";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function VoiceInput({ onTranscript, showToast }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Verificar soporte de Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = 'es-AR';
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript.trim();
          onTranscript(transcript);
          showToast(`Tarea capturada: "${transcript}"`, "success");
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Error de reconocimiento de voz:', event.error);
          setIsListening(false);
          showToast("Error al capturar voz", "error");
        };

        setRecognition(recognitionInstance);
      } else {
        setIsSupported(false);
      }
    }
  }, [onTranscript, showToast]);

  const handleClick = () => {
    if (!isSupported) {
      showToast("Reconocimiento de voz no disponible en este navegador", "error");
      return;
    }

    if (!isListening && recognition) {
      recognition.start();
      setIsListening(true);
      showToast("Escuchando... Habla ahora", "success");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isSupported}
      className={`w-12 h-12 rounded-xl transition-all duration-200 transform flex items-center justify-center shrink-0 ${
        isListening
          ? "bg-linear-to-r from-red-500 to-red-600 animate-pulse shadow-xl shadow-red-500/50"
          : isSupported
          ? "bg-linear-to-r from-[#2D2D2D] to-[#1A1A1A] hover:from-[#1A1A1A] hover:to-[#0D0D0D] text-[#FFB347] border border-[#FFB347]/50 hover:scale-[1.02] shadow-xl hover:shadow-[#FFB347]/20"
          : "bg-gray-700 cursor-not-allowed opacity-50"
      }`}
      title={isListening ? "Escuchando..." : "Agregar tarea por voz"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="24px" 
        viewBox="0 -960 960 960" 
        width="24px" 
        fill={isListening ? "#ffffff" : "#FFB347"}
      >
        <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/>
      </svg>
    </button>
  );
}

VoiceInput.propTypes = {
  onTranscript: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired
};
