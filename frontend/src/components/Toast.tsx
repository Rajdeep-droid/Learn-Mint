"use client";

// ============================================================================
// TOAST — Brutalist notification popup
// ============================================================================
// Global toast context. Call showToast("MESSAGE") from anywhere.
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface ToastContextType {
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast ${visible ? "show" : ""}`}>{message}</div>
    </ToastContext.Provider>
  );
}
