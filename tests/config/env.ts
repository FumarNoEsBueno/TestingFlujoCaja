/**
 * Configuración centralizada de ambiente.
 * Lee variables de .env y provee valores tipados para toda la suite de tests.
 */
export const config = {
  // ─── URLs ────────────────────────────────────────────────────────────────
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200',
  },

  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:8000',
    apiPrefix: '/api',
  },

  // ─── Credenciales Admin ──────────────────────────────────────────────────
  admin: {
    rut: process.env.ADMIN_USER_RUT || '',
    dv: process.env.ADMIN_USER_DV || '',
    password: process.env.ADMIN_USER_PASSWORD || '',
  },

  // ─── Credenciales Usuario Estándar ──────────────────────────────────────
  user: {
    rut: process.env.USER_USER_RUT || '',
    dv: process.env.USER_USER_DV || '',
    password: process.env.USER_USER_PASSWORD || '',
  },

  // ─── Timeouts (ms) ──────────────────────────────────────────────────────
  timeouts: {
    default: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10),
    asyncOperation: parseInt(process.env.ASYNC_OPERATION_TIMEOUT || '10000', 10),
  },

  // ─── Reportería ─────────────────────────────────────────────────────────
  reporting: {
    videoRecording: process.env.VIDEO_RECORDING || 'retain-on-failure',
    traceCollection: process.env.TRACE_COLLECTION || 'on-first-retry',
  },
} as const;

/**
 * Helper para obtener la URL completa de un endpoint del backend.
 */
export function backendUrl(endpoint: string): string {
  const base = config.backend.url.replace(/\/$/, '');
  const prefix = config.backend.apiPrefix.replace(/^\//, '');
  const path = endpoint.replace(/^\//, '');
  return `${base}/${prefix}/${path}`;
}

/**
 * Helper para obtener la URL completa de una ruta del frontend.
 */
export function frontendUrl(path: string): string {
  const base = config.frontend.url.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${base}/${cleanPath}`;
}
