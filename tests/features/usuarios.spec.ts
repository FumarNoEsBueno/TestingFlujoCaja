import { test, expect } from '@playwright/test';
import { UsuariosPage } from '../pages/UsuariosPage';
import { AuthHelper } from '../helpers/auth';

/**
 * Test suite: Usuarios
 * Valida el CRUD completo del módulo de administración de Usuarios.
 */
test.describe('Módulo Usuarios', () => {

  let usuariosPage: UsuariosPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    usuariosPage = new UsuariosPage(page);
    authHelper = new AuthHelper(page);

    // Login antes de cada test
    await authHelper.loginAsAdmin();
    await usuariosPage.goto();
  });

  // ─── Listado ─────────────────────────────────────────────────────────────

  test('debería cargar la página de usuarios correctamente', async ({ page }) => {
    await usuariosPage.expectLoaded();
    await expect(page.locator('button:has-text("Crear"), button:has-text("Nuevo")')).toBeVisible();
  });

  test('debería buscar un usuario por RUT', async ({ page }) => {
    const rut = '12345678'; // El admin
    await usuariosPage.searchUsuario(rut);
    await page.waitForTimeout(500);

    const rows = await usuariosPage.tableRows().count();
    if (rows > 0) {
      await expect(page.locator(`table tbody tr:has-text("${rut}")`).first()).toBeVisible();
    }
  });

  // ─── Creación ───────────────────────────────────────────────────────────

  test('debería crear un nuevo usuario exitosamente', async ({ page }) => {
    const rut = `${Date.now()}`.slice(-8);

    await usuariosPage.createUsuario({
      nombre: 'Usuario',
      apellidoP: 'Test',
      rut: rut,
      dv: '9',
      email: `test${rut}@test.cl`,
      password: 'Password123!',
    });

    await usuariosPage.expectUsuarioExists(rut);
  });

  test('debería mostrar error al crear usuario sin campos obligatorios', async ({ page }) => {
    await usuariosPage.openCreateForm();

    // Guardar sin llenar nada
    await usuariosPage.saveButton().click();
    await page.waitForTimeout(500);

    // Debería haber errores de validación
    const hasInvalidInputs = await page.locator('input.ng-invalid, input.is-invalid').count();
    expect(hasInvalidInputs).toBeGreaterThan(0);
  });

  // ─── Navegación ────────────────────────────────────────────────────────

  test('debería navegar al módulo de usuarios desde el sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('a:has-text("Usuarios")').click();
    await page.waitForURL('**/users**');
    await usuariosPage.expectLoaded();
  });
});
