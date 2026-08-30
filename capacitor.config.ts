import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ccseprep.app",
  appName: "CCSE Prep 2026",
  webDir: "out",
  server: {
    url: process.env.CAPACITOR_SERVER_URL ?? "https://ccse-prep.vercel.app",
    cleartext: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0f766e",
    },
  },
};

export default config;
