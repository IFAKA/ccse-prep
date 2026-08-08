export type SoundName = "select" | "correct" | "incorrect" | "mock-start" | "mock-complete" | "toggle";

const preferenceKey = "ccse-prep:sound-effects";
let audioContext: AudioContext | undefined;

export function soundEffectsEnabled() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(preferenceKey) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEffectsEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(preferenceKey, enabled ? "on" : "off");
  } catch {
    // A blocked storage area should not prevent the control from working.
  }
}

function getAudioContext() {
  if (typeof window === "undefined") return undefined;
  const AudioContextConstructor = window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return undefined;
  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

function tone(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playUiSound(name: SoundName) {
  if (!soundEffectsEnabled()) return;
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  void context.resume().catch(() => undefined);

  switch (name) {
    case "select":
      tone(context, 560, now, 0.045, 0.018);
      break;
    case "correct":
      tone(context, 523.25, now, 0.11, 0.028, "triangle");
      tone(context, 659.25, now + 0.07, 0.15, 0.024, "triangle");
      break;
    case "incorrect":
      tone(context, 220, now, 0.13, 0.024, "sine");
      tone(context, 174.61, now + 0.055, 0.16, 0.02, "sine");
      break;
    case "mock-start":
      tone(context, 392, now, 0.08, 0.02, "triangle");
      tone(context, 523.25, now + 0.07, 0.13, 0.024, "triangle");
      break;
    case "mock-complete":
      tone(context, 392, now, 0.09, 0.022, "triangle");
      tone(context, 493.88, now + 0.08, 0.09, 0.022, "triangle");
      tone(context, 587.33, now + 0.16, 0.16, 0.025, "triangle");
      break;
    case "toggle":
      tone(context, 660, now, 0.07, 0.02);
      break;
  }
}
