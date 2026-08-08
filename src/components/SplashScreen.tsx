"use client";

import { useEffect, useState } from "react";
import CCSEMark from "./CCSEMark";

const splashSeenKey = "ccse-prep:splash-seen";

function shouldShowSplash() {
  try { return window.sessionStorage.getItem(splashSeenKey) !== "true"; } catch { return true; }
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(shouldShowSplash);

  useEffect(() => {
    if (!visible) return;
    try { window.sessionStorage.setItem(splashSeenKey, "true"); } catch { /* storage can be unavailable */ }
    const timer = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return <div className="splash-screen" role="status" aria-label="CCSE Prep 2026" aria-live="polite">
    <div className="splash-lockup">
      <div className="splash-mark-wrap"><CCSEMark animated className="h-14 w-14" /></div>
      <div className="splash-wordmark">CCSE Prep <span>2026</span></div>
      <p className="splash-caption">Preparación oficial · Local-first</p>
    </div>
  </div>;
}
