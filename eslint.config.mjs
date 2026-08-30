import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  { ignores: ["src/lib/terminalQuiz.d.mts"] },
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
