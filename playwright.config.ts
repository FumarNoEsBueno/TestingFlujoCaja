import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  // Directorio donde están los tests
  testDir: './tests/features',

  // Archivos de test a ejecutar
  testMatch: '**/*.spec.ts',

  // Timeout por defecto para cada test (30 segundos)
  timeout: 30_000,

  // Timeout para operaciones de expect
  expect: {
    timeout: 5_000,
  },

  // Reportes
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
  ],

  // Configuración global de requests
  use: {
    // Base URL del frontend (se puede override por test)
    baseURL: process.env.FRONTEND_URL || 'http://localhost:4200',

    // Tomar screenshot al fallar
    screenshot: 'only-on-failure',

    // Grabar video al fallar
    video: 'retain-on-failure',

    // Trace en caso de error
    trace: 'on-first-retry',

    // Ignorar HTTPS errors (útil en ambientes de staging)
    ignoreHTTPSErrors: true,

    // Headers por defecto
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  // Proyectos (configuraciones por navegador)
  projects: [
    // Chromium (el más estable para CI)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Override baseURL por proyecto si es necesario
        baseURL: process.env.FRONTEND_URL || 'http://localhost:4200',
      },
    },

    // Firefox (para verificar compatibilidad cross-browser)
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // WebKit (Safari)
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile Chrome (opcional, para tests responsive)
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Configuración del servidor web (si necesitas que Playwright lo maneje)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:4200',
  //   reuseExistingServer: true,
  //   timeout: 120_000,
  // },

  // Configuración de output para artefactos
  outputDir: 'test-results/',

  // Forzar color output
  forbidOnly: !!process.env.CI,
});
