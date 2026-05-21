# TestingFlujoCaja

> Suite de pruebas automatizadas E2E para el sistema Marbella — Gestión de Cajas.
> Construido con **Playwright + TypeScript** + Page Objects pattern.

---

## Estructura del proyecto

```
TestingFlujoCaja/
├── playwright.config.ts     # Configuración principal de Playwright
├── tsconfig.json            # Configuración de TypeScript
├── package.json
├── .env                     # Credenciales y URLs (NO commitear)
├── .env.example             # Plantilla de .env
├── README.md
│
├── tests/
│   ├── config/
│   │   └── env.ts           # Loader centralizado de variables de ambiente
│   │
│   ├── helpers/
│   │   └── auth.ts          # Helper reutilizable para login/logout
│   │
│   ├── pages/               # Page Objects — abstracción de páginas
│   │   ├── BasePage.ts      # Clase base con métodos comunes
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── RolesPage.ts
│   │   └── UsuariosPage.ts
│   │
│   └── features/            # Test specs — tests reales
│       ├── auth.spec.ts
│       ├── roles.spec.ts
│       ├── usuarios.spec.ts
│       └── productos.spec.ts
│
└── reports/                 # Reportes HTML de Playwright
    └── html/
```

---

## Setup inicial

### 1. Instalar dependencias

```bash
cd TestingFlujoCaja
npm install
```

### 2. Configurar credenciales

```bash
cp .env.example .env
# Editar .env con las credenciales reales
```

### 3. Instalar navegadores (solo la primera vez)

```bash
npx playwright install chromium
```

---

## Uso rápido

### Correr todos los tests

```bash
npm test
```

### Correr un módulo específico

```bash
npm run test:auth      # Solo auth
npm run test:roles     # Solo roles
npm run test:usuarios   # Solo usuarios
npm run test:productos  # Solo productos
```

### Correr con UI visual (headed)

```bash
npm run test:headed
```

### Abrir UI de Playwright para grabar tests

```bash
npm run test:ui
```

### Ver reporte HTML del último run

```bash
npm run report
```

---

## Rotación de ambientes

Editar `.env` y cambiar las URLs:

```bash
# Desarrollo local
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:8000

# Staging
# FRONTEND_URL=https://staging.flujocaja.cl
# BACKEND_URL=https://staging-api.flujocaja.cl

# Producción
# FRONTEND_URL=https://flujocaja.cl
# BACKEND_URL=https://api.flujocaja.cl
```

También cambiar las credenciales (`ADMIN_USER_RUT`, `ADMIN_USER_DV`, `ADMIN_USER_PASSWORD`) según correspondan al ambiente.

---

## Credenciales necesarias

### Variables de ambiente obligatorias

| Variable | Descripción |
|----------|-------------|
| `FRONTEND_URL` | URL base del frontend |
| `BACKEND_URL` | URL base del backend (API) |
| `ADMIN_USER_RUT` | RUT del usuario admin (sin DV) |
| `ADMIN_USER_DV` | Dígito verificador del RUT |
| `ADMIN_USER_PASSWORD` | Contraseña del admin |
| `USER_USER_RUT` | RUT del usuario estándar |
| `USER_USER_DV` | DV del usuario estándar |
| `USER_USER_PASSWORD` | Contraseña del usuario estándar |

---

## Agregar nuevos tests

### 1. Crear el Page Object (si no existe)

```typescript
// tests/pages/NuevaPaginaPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class NuevaPaginaPage extends BasePage {
  readonly url = '/nueva-pagina';

  async goto(): Promise<void> {
    await this.navigateTo(this.url);
    await this.waitForLoadState();
  }
}
```

### 2. Crear el spec

```typescript
// tests/features/nueva-pagina.spec.ts
import { test, expect } from '@playwright/test';
import { NuevaPaginaPage } from '../pages/NuevaPaginaPage';
import { AuthHelper } from '../helpers/auth';

test.describe('Nueva Página', () => {
  let page: NuevaPaginaPage;
  let auth: AuthHelper;

  test.beforeEach(async ({ page: pw }) => {
    page = new NuevaPaginaPage(pw);
    auth = new AuthHelper(pw);
    await auth.loginAsAdmin();
    await page.goto();
  });

  test('debería cargar correctamente', async () => {
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

---

## Configuración de Playwright

Edita `playwright.config.ts` para cambiar:

- `timeout` global
- Navegadores a usar (`chromium`, `firefox`, `webkit`)
- Directorio de reportes
- Configuración de video y trace

---

## Tips

- **¿El test falla?** Revisa `reports/html/index.html` para ver screenshots y traces del momento exacto del fallo.
- **¿La página tarda en cargar?** Aumenta `timeout` en `playwright.config.ts` o en el test individual.
- **¿Necesitas debuggear?** Usa `test:debug` o agrega `await page.pause()` dentro del test.
- **¿Credenciales de producción?** NUNCA las guardes en `.env` — usa un `.env.production` local o un secrets manager.

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm test
        env:
          FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
          ADMIN_USER_RUT: ${{ secrets.ADMIN_USER_RUT }}
          ADMIN_USER_DV: ${{ secrets.ADMIN_USER_DV }}
          ADMIN_USER_PASSWORD: ${{ secrets.ADMIN_USER_PASSWORD }}
```
