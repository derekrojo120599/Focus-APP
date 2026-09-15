import React, { useState, useEffect, useCallback } from "react";
import { FOCUS_PHRASES, BREAK_PHRASES } from "../utils/constants";

export default function MotivationalQuote({ mode, running }) {
  const [quote, setQuote] = useState("");
  const [fade, setFade] = useState(true);

  const pickQuote = useCallback(() => {
    if (mode === "done") return "¡¡Tiempo cumplido! Gran esfuerzo.";
    const list = mode === "work" ? FOCUS_PHRASES : BREAK_PHRASES;
    return list[Math.floor(Math.random() * list.length)];
  }, [mode]);

  const updateQuote = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setQuote(pickQuote());
      setFade(true);
    }, 400);
  }, [pickQuote]);

  useEffect(() => {
    updateQuote();
  }, [mode, updateQuote]);

  useEffect(() => {
    if (!running || mode === "done") return;
    const id = setInterval(() => {
      updateQuote();
    }, 3 * 60 * 1000);
    return () => clearInterval(id);
  }, [running, mode, updateQuote]);

  return (
    <div className={`quote-container ${fade ? "fade-in" : "fade-out"}`}>
      {quote}
    </div>
  );
}
