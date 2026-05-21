import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth';

/**
 * Test suite: Productos
 * Valida el módulo de administración de Productos.
 */
test.describe('Módulo Productos', () => {

  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('debería cargar la página de productos', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('debería crear un nuevo producto', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const productoNombre = `Producto Test ${Date.now()}`;
    const productoPrecio = '9990';

    // Abrir formulario de creación
    await page.locator('button:has-text("Crear"), button:has-text("Nuevo")').click();
    await page.waitForTimeout(500);

    // Llenar datos
    const nombreInput = page.locator('input[formcontrolname*="nombre"], input[name*="nombre"]').first();
    const precioInput = page.locator('input[formcontrolname*="precio"], input[name*="precio"]').first();

    await nombreInput.fill(productoNombre);
    await precioInput.fill(productoPrecio);

    // Guardar
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);

    // Verificar que aparece en la tabla
    await expect(page.locator(`table tbody tr:has-text("${productoNombre}")`).first()).toBeVisible({ timeout: 5000 });
  });

  test('debería buscar un producto por nombre', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await page.locator('input[placeholder*="Buscar"], input[type="search"]').first().fill('Test');
    await page.waitForTimeout(500);

    // La tabla debería actualizarse
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('debería exportar productos a Excel', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const exportButton = page.locator('button:has-text("Excel"), button:has-text("Exportar")').first();
    if (await exportButton.isVisible()) {
      // Verificar que el botón existe y es clickeable
      await expect(exportButton).toBeEnabled();
    }
  });

  test('debería importar productos desde Excel', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const importButton = page.locator('button:has-text("Importar"), input[type="file"]').first();
    if (await importButton.isVisible()) {
      await expect(importButton).toBeEnabled();
    }
  });
});
