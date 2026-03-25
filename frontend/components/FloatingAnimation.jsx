"use client";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function FloatingAnimation({ children, delay = 3000 }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.classList.add("animate-float");
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={elementRef} className="inline-block">
      {children}
    </div>
  );
}

FloatingAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number
};
