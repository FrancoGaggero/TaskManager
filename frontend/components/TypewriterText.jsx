"use client";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export default function TypewriterText({ text = "TaskManager Pro", blueText = "Pro" }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100); // Velocidad de escritura: 100ms por caracter

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  // Calcular qué parte es "Pro" para colorearla
  const blueStartIndex = text.length - blueText.length;
  const beforeBlue = displayText.substring(0, blueStartIndex);
  const bluePartDisplayed = displayText.substring(blueStartIndex);

  return (
    <span>
      {beforeBlue}
      {currentIndex >= blueStartIndex && (
        <span className="text-[#FFB347]">{bluePartDisplayed}</span>
      )}
    </span>
  );
}

TypewriterText.propTypes = {
  text: PropTypes.string,
  blueText: PropTypes.string
};
