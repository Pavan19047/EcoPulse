"use client";

import React from "react";
import { useNavigationProgress } from "@/components/ui/top-loader";

export default function RouterProgressListener() {
  const { start } = useNavigationProgress();
  React.useEffect(() => {
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    const startOnNav = () => setTimeout(() => start(), 0);
    (history as any).pushState = function (this: History) {
      startOnNav();
      return (origPush as any).apply(history, arguments as any);
    } as any;
    (history as any).replaceState = function (this: History) {
      startOnNav();
      return (origReplace as any).apply(history, arguments as any);
    } as any;
  const onPop = () => startOnNav();
    window.addEventListener("popstate", onPop);
    return () => {
      (history as any).pushState = origPush as any;
      (history as any).replaceState = origReplace as any;
      window.removeEventListener("popstate", onPop);
    };
  }, [start]);
  return null;
}
