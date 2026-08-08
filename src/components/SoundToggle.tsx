"use client";

import { useState } from "react";
import { playUiSound, setSoundEffectsEnabled, soundEffectsEnabled } from "@/lib/sound";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(soundEffectsEnabled);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEffectsEnabled(next);
    if (next) playUiSound("toggle");
  };

  return (
    <button
      type="button"
      className="focus-ring sound-toggle rounded-lg px-2 py-2 text-[13px] text-[var(--secondary)]"
      aria-pressed={enabled}
      aria-label={`${enabled ? "Mute" : "Enable"} sound effects`}
      onClick={toggle}
    >
      <span aria-hidden="true" className="mr-1.5">{enabled ? "⌁" : "×"}</span>
      Sound {enabled ? "On" : "Off"}
    </button>
  );
}
