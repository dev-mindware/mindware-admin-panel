import { defineConfig } from "@playwright/test";

/**
 * Testes e2e da app (API simulada no próprio teste, sem backend).
 * Pré-requisito: `pnpm --filter doc-generator build`. Correr: `pnpm --filter doc-generator-e2e test`.
 * Ecrãs: dois telefones, um tablet e o ambiente de trabalho.
 */
const touch = { isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 3,
  reporter: [["list"]],
  outputDir: "./.results",
  use: {
    baseURL: "http://localhost:3008/doc-generator/",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    },
  },
  webServer: {
    command: "pnpm --filter doc-generator exec next start --port 3008",
    url: "http://localhost:3008/doc-generator/login",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: "phone-360", use: { viewport: { width: 360, height: 740 }, ...touch } },
    { name: "phone-390", use: { viewport: { width: 390, height: 844 }, ...touch } },
    { name: "tablet-768", use: { viewport: { width: 768, height: 1024 }, ...touch } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
});
