import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  console: "readonly",
  FormData: "readonly",
  File: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  fetch: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  localStorage: "readonly",
  AbortController: "readonly",
  IntersectionObserver: "readonly",
};

const nodeGlobals = {
  process: "readonly",
  Buffer: "readonly",
  fetch: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  console: "readonly",
  __dirname: "readonly",
};

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "no-unused-vars": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    files: ["api/**/*.js", "vite.config.js", "tailwind.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
  {
    files: ["tests/**/*.{js,jsx}", "vitest.setup.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
        globalThis: "readonly",
        AbortSignal: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { react },
    rules: {
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
