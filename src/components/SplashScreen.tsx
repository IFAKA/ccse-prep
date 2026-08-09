"use client";

import { useEffect, useState } from "react";
const splashSeenKey = "ccse-prep:splash-seen";

function shouldShowSplash() {
  try { return window.sessionStorage.getItem(splashSeenKey) !== "true"; } catch { return true; }
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShowSplash()) return;

    setVisible(true);
    try { window.sessionStorage.setItem(splashSeenKey, "true"); } catch { /* storage can be unavailable */ }
    const timer = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return <section className="nf-center" role="status" aria-label="CCSE Prep 2026" aria-live="polite">
    <div className="nf-card nf-stack">
      <strong>CCSE Prep <span>2026</span></strong>
      <p>Preparación oficial · Local-first</p>
    </div>
  </section>;
}
