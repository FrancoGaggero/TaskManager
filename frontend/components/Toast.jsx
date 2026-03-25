"use client";
import { useEffect } from "react";
import PropTypes from "prop-types";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" 
    ? "bg-linear-to-r from-green-500 to-emerald-600" 
    : "bg-linear-to-r from-red-500 to-rose-600";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border border-white/20`}
      >
        <span className="text-2xl">
          {type === "success" ? "✓" : "✕"}
        </span>
        <span className="flex-1 font-medium text-lg">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white font-bold text-2xl transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  onClose: PropTypes.func.isRequired
};
