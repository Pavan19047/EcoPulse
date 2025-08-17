"use client";

import React from "react";

type Ctx = {
  start: () => void;
  finish: () => void;
};

const NavigationProgressContext = React.createContext<Ctx | null>(null);

export function useNavigationProgress() {
  const ctx = React.useContext(NavigationProgressContext);
  if (!ctx) throw new Error("useNavigationProgress must be used within NavigationProgressProvider");
  return ctx;
}

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = React.useCallback(() => {
    clearTimer();
    setVisible(true);
    setProgress(10);
    // Trickle progress up to 90%
    timerRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const delta = Math.max(0.5, (90 - p) / 20);
        return Math.min(90, p + delta);
      });
    }, 200);
  }, []);

  const finish = React.useCallback(() => {
    setProgress(100);
    clearTimer();
    // Hide shortly after completing
    window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
  }, []);

  const value = React.useMemo(() => ({ start, finish }), [start, finish]);

  return (
    <NavigationProgressContext.Provider value={value}>
      {/* Top bar */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: visible ? `${progress}%` : 0,
          height: 3,
          background: "linear-gradient(90deg,#3b82f6,#22d3ee)",
          boxShadow: visible ? "0 0 8px rgba(59,130,246,.6)" : "none",
          transition: "width 150ms ease-out, opacity 250ms",
          opacity: visible ? 1 : 0,
          zIndex: 60,
        }}
      />
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavProgressOnPathChange() {
  // Utility hook: call finish() when path changes (used in layouts/pages)
  const { finish } = useNavigationProgress();
  const pathname = require("next/navigation").usePathname();
  const prevRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (prevRef.current && prevRef.current !== pathname) {
      // Path actually changed -> finish the loader
      finish();
    }
    prevRef.current = pathname;
  }, [pathname, finish]);
}
