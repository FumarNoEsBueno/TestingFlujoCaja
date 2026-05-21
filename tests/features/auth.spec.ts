import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AuthHelper } from '../helpers/auth';
import { config } from '../config/env';

/**
 * Test suite: Autenticación
 * Valida el flujo completo de login y logout del sistema.
 */
test.describe('Autenticación', () => {

  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);

    // Limpiar sesión para asegurar estado fresco
    await authHelper.clearSession();
  });

  // ─── Login ───────────────────────────────────────────────────────────────

  test('debería mostrar la página de login correctamente', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectLoaded();

    // Verificar elementos del formulario usando los métodos del Page Object
    await expect(loginPage.rutInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.submitButton()).toBeVisible();
  });

  test('debería iniciar sesión como administrador exitosamente', async ({ page }) => {
    await loginPage.loginAsAdmin();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectUserNameVisible('Manuel Pereira');
  });

  test('debería fallar con credenciales inválidas', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginWithInvalidCredentials();
    await loginPage.expectInvalidCredentialsError();
  });

  test('debería mantener el formulario vacío al cargar la página', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectFormEmpty();
  });

  // ─── Sesión ─────────────────────────────────────────────────────────────

  test('debería mantener la sesión activa al recargar la página', async ({ page }) => {
    await authHelper.loginAsAdmin();

    // Recargar la página
    await page.reload();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectUserNameVisible('Manuel Pereira');
  });

  test('debería mostrar el dashboard con los módulos correctos', async ({ page }) => {
    await authHelper.loginAsAdmin();
    await dashboardPage.expectLoaded();

    const expectedModules = ['Dashboard', 'Movimientos', 'Reportes', 'Productos', 'Usuarios', 'Roles'];
    await dashboardPage.expectModulesVisible(expectedModules);
  });

  test('debería mostrar las tarjetas de resumen en el dashboard', async ({ page }) => {
    await authHelper.loginAsAdmin();
    await dashboardPage.expectSummaryCardsVisible();
  });

  // ─── Logout ─────────────────────────────────────────────────────────────

  test('debería cerrar sesión correctamente', async ({ page }) => {
    await authHelper.loginAsAdmin();
    await authHelper.logout();

    // Verificar que estamos en login
    await loginPage.expectLoaded();
    await loginPage.expectFormEmpty();
  });

  test('debería redirigir al login si no hay sesión activa', async ({ page }) => {
    // Ir al dashboard sin estar logueado
    await page.goto('/dashboard');

    // Debería redirigir a login
    await expect(page).toHaveURL(/login/);
  });
});
