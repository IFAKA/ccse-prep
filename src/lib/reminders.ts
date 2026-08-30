import { Capacitor } from "@capacitor/core";
import type { Settings } from "./types";

export const DAILY_REMINDER_ID = 20260924;
export const TEST_REMINDER_ID = 20260925;

export function isNativeReminderAvailable() {
  return Capacitor.isNativePlatform();
}

function nextReminderDate(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date;
}

export async function scheduleDailyReminder(settings: Settings) {
  if (!isNativeReminderAvailable()) return { scheduled: false, reason: "native-only" as const };

  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const permission = await LocalNotifications.checkPermissions();
  const granted = permission.display === "granted"
    ? permission
    : await LocalNotifications.requestPermissions();
  if (granted.display !== "granted") return { scheduled: false, reason: "permission-denied" as const };

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });
  if (!settings.remindersEnabled) return { scheduled: true, reason: "disabled" as const };

  await LocalNotifications.schedule({
    notifications: [{
      id: DAILY_REMINDER_ID,
      title: "CCSE Prep",
      body: "A short study session today keeps your review streak moving.",
      schedule: { at: nextReminderDate(settings.reminderHour, settings.reminderMinute), repeats: true, every: "day" },
      extra: { route: "/study" },
    }],
  });
  return { scheduled: true, reason: "scheduled" as const };
}

export async function scheduleTestReminder() {
  if (!isNativeReminderAvailable()) return { scheduled: false, reason: "native-only" as const };

  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const permission = await LocalNotifications.checkPermissions();
  const granted = permission.display === "granted"
    ? permission
    : await LocalNotifications.requestPermissions();
  if (granted.display !== "granted") return { scheduled: false, reason: "permission-denied" as const };

  await LocalNotifications.schedule({
    notifications: [{
      id: TEST_REMINDER_ID,
      title: "CCSE Prep Test Reminder",
      body: "This is how your study reminder will look.",
      schedule: { at: new Date(Date.now() + 2_000) },
      extra: { route: "/study", test: true },
    }],
  });
  return { scheduled: true, reason: "scheduled" as const };
}
