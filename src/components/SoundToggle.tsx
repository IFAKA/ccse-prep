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
      aria-pressed={enabled}
      aria-label={`${enabled ? "Mute" : "Enable"} sound effects`}
      onClick={toggle}
    >
      Sound {enabled ? "On" : "Off"}
    </button>
  );
}
