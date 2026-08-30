# Android Port

The Android project is generated with Capacitor and the first native feature is local daily reminders.

## Current Boundary

- The React/Next UI and IndexedDB event log remain the source of truth.
- Android reminders use `@capacitor/local-notifications` and are opt-in from Settings.
- The reminder is scheduled again when the app loads, so changing or reinstalling the app does not require a separate setup screen.
- The home-screen widget is intentionally a second milestone after notification delivery is verified on the Redmi Note 14 5G.

## Native Build Follow-up

The current Next app contains a server-rendered `/api/sync` signaling route, while Capacitor’s bundled mode requires a static `out/` directory. The first installable APK uses the hosted web app through Capacitor’s secure `server.url` setting:

1. Keep sync hosted and make a static native export for the app bundle.
2. Load the hosted web app through Capacitor’s `server.url` for the first APK, accepting that the native shell depends on network access at first launch.

The first option remains the recommended production path because it preserves offline study. The sync signaling service can remain hosted while the actual study data stays local. The hosted APK is an installable test build, not the final offline release.
