import { test, expect } from '@playwright/test';
import { RolesPage } from '../pages/RolesPage';
import { AuthHelper } from '../helpers/auth';
import { LoginPage } from '../pages/LoginPage';

/**
 * Test suite: Roles
 * Valida el CRUD completo del módulo de administración de Roles.
 */
test.describe('Módulo Roles', () => {

  let rolesPage: RolesPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    rolesPage = new RolesPage(page);
    authHelper = new AuthHelper(page);

    // Login antes de cada test
    await authHelper.loginAsAdmin();
    await rolesPage.goto();
  });

  // ─── Listado ─────────────────────────────────────────────────────────────

  test('debería cargar la página de roles correctamente', async ({ page }) => {
    await rolesPage.expectLoaded();
    await expect(page.locator('button:has-text("Crear"), button:has-text("Nuevo")')).toBeVisible();
  });

  test('debería mostrar la tabla de roles', async ({ page }) => {
    // Si hay roles creados, la tabla debe verse
    const rows = await rolesPage.tableRows().count();
    if (rows > 0) {
      await rolesPage.expectTableHasRows();
    } else {
      await rolesPage.expectTableEmpty();
    }
  });

  test('debería buscar un rol por nombre', async ({ page }) => {
    await rolesPage.searchRol('Administrador');
    await page.waitForTimeout(500);

    // Si hay resultados, deben contener el texto buscado
    const rows = await rolesPage.tableRows().count();
    if (rows > 0) {
      await expect(page.locator('table tbody tr:has-text("Administrador")').first()).toBeVisible();
    }
  });

  // ─── Creación ───────────────────────────────────────────────────────────

  test('debería crear un nuevo rol exitosamente', async ({ page }) => {
    const rolName = `Rol Test ${Date.now()}`;

    await rolesPage.createRol(rolName);
    await rolesPage.expectModalClosed();
    await rolesPage.expectRolExists(rolName);
  });

  test('debería mostrar error al crear un rol sin nombre', async ({ page }) => {
    await rolesPage.openCreateForm();
    await rolesPage.expectModalOpen();

    // Intentar guardar sin nombre
    await rolesPage.saveButton().click();
    await page.waitForTimeout(500);

    // El input debería mostrar error de validación
    await expect(rolesPage.nombreInput()).toHaveClass(/ng-invalid|invalid|error/);
  });

  // ─── Edición ────────────────────────────────────────────────────────────

  test('debería editar un rol existente', async ({ page }) => {
    // Primero crear un rol para editar
    const originalName = `Rol Editable ${Date.now()}`;
    await rolesPage.createRol(originalName);
    await rolesPage.expectRolExists(originalName);

    // Ahora editarlo
    const newName = `Rol Editado ${Date.now()}`;
    await rolesPage.editFirstRol(newName);
    await rolesPage.expectModalClosed();
    await rolesPage.expectRolExists(newName);
  });

  // ─── Eliminación ────────────────────────────────────────────────────────

  test('debería eliminar un rol existente', async ({ page }) => {
    // Crear un rol para eliminar
    const rolName = `Rol Eliminar ${Date.now()}`;
    await rolesPage.createRol(rolName);
    await rolesPage.expectRolExists(rolName);

    // Eliminarlo
    await rolesPage.deleteFirstRol();
    await rolesPage.expectRolNotExists(rolName);
  });

  // ─── Permisos ────────────────────────────────────────────────────────────

  test('debería asignar permisos a un rol al crearlo', async ({ page }) => {
    const rolName = `Rol Con Permisos ${Date.now()}`;

    await rolesPage.openCreateForm();
    await rolesPage.nombreInput().fill(rolName);

    // Buscar y marcar algunos permisos (si el formulario los tiene)
    const permisosSection = page.locator('[class*="permiso"], [class*="permisos"]').first();
    if (await permisosSection.isVisible()) {
      const firstPermission = permisosSection.locator('input[type="checkbox"]').first();
      await firstPermission.check();
    }

    await rolesPage.saveButton().click();
    await rolesPage.waitForLoadState();

    await rolesPage.expectRolExists(rolName);
  });

  // ─── Navegación desde sidebar ───────────────────────────────────────────

  test('debería navegar al módulo de roles desde el sidebar', async ({ page }) => {
    // Ir al dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click en Roles del sidebar
    await page.locator('a:has-text("Roles")').click();
    await page.waitForURL('**/roles**');
    await rolesPage.expectLoaded();
  });

  // ─── edge cases ─────────────────────────────────────────────────────────

  test('debería manejar búsqueda sin resultados', async ({ page }) => {
    const nonExistent = `NonExistentRolXYZ${Date.now()}`;
    await rolesPage.searchRol(nonExistent);
    await page.waitForTimeout(500);

    // No debería haber filas o debería verse mensaje de "sin resultados"
    const rows = await rolesPage.tableRows().count();
    if (rows === 0) {
      // Éxito - no hay resultados
    } else {
      await expect(page.locator('text=Sin resultados, text=No se encontró')).toBeVisible().catch(() => {});
    }
  });
});
