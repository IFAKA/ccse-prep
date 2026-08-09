"use client";

import { useState } from "react";
import { playUiSound, setSoundEffectsEnabled, soundEffectsEnabled } from "@/lib/sound";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(soundEffectsEnabled);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.checked;
    setEnabled(next);
    setSoundEffectsEnabled(next);
    if (next) playUiSound("toggle");
  };

  return (
    <label className="nf-toggle">
      <input
        type="checkbox"
        checked={enabled}
        aria-label="Sound Effects"
        onChange={handleChange}
      />
      <span className="nf-toggle-control" aria-hidden="true" />
      <span>{enabled ? "On" : "Off"}</span>
    </label>
  );
}
