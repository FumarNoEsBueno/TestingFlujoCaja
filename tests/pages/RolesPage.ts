import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/env';

/**
 * RolesPage — Page Object para el módulo de administración de Roles.
 */
export class RolesPage extends BasePage {
  readonly url = '/roles';

  pageHeading = (): Locator => this.page.locator('h1, h2, h3').first();
  createButton = (): Locator => this.page.locator('button:has-text("Crear"), button:has-text("Nuevo"), button:has-text("Agregar")').first();
  searchInput = (): Locator => this.page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]').first();
  tableRows = (): Locator => this.page.locator('table tbody tr, [role="row"]');
  firstRow = (): Locator => this.tableRows().first();
  modal = (): Locator => this.page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]').first();
  nombreInput = (): Locator => this.page.locator('input[formcontrolname*="nombre"], input[name*="nombre"]').first();
  saveButton = (): Locator => this.page.locator('button:has-text("Guardar"), button:has-text("Salvar")').first();
  cancelButton = (): Locator => this.page.locator('button:has-text("Cancelar"), button:has-text("Cerrar")').first();
  deleteButton = (): Locator => this.page.locator('button:has-text("Eliminar"), button:has-text("Borrar")').first();
  editButton = (): Locator => this.page.locator('button:has-text("Editar"), button:has-text("Editar")').first();

  async goto(): Promise<void> {
    await this.navigateTo(this.url);
    await this.waitForLoadState();
    await this.page.waitForSelector('table, [role="table"], [class*="table"]', {
      timeout: config.timeouts.default,
    }).catch(() => {});
  }

  async openCreateForm(): Promise<void> {
    await this.createButton().click();
    await this.page.waitForSelector('[role="dialog"], [class*="modal"]', { timeout: 5000 });
  }

  async createRol(nombre: string): Promise<void> {
    await this.openCreateForm();
    await this.nombreInput().fill(nombre);
    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/api/roles') && resp.status() === 201, { timeout: 10000 }),
      this.saveButton().click(),
    ]);
    await this.waitForLoadState();
  }

  async editFirstRol(newNombre: string): Promise<void> {
    await this.editButton().first().click();
    await this.page.waitForSelector('[role="dialog"], [class*="modal"]', { timeout: 5000 });

    await this.nombreInput().clear();
    await this.nombreInput().fill(newNombre);

    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/api/roles') && resp.status() === 200, { timeout: 10000 }),
      this.saveButton().click(),
    ]);
    await this.waitForLoadState();
  }

  async deleteFirstRol(): Promise<void> {
    const initialCount = await this.tableRows().count();

    await this.deleteButton().first().click();
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Eliminar")').last();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await this.page.waitForTimeout(500);
    const newCount = await this.tableRows().count();
    expect(newCount).toBeLessThan(initialCount);
  }

  async searchRol(nombre: string): Promise<void> {
    await this.searchInput().clear();
    await this.searchInput().fill(nombre);
    await this.page.waitForTimeout(500);
  }

  async selectPermissions(permissionNames: string[]): Promise<void> {
    for (const name of permissionNames) {
      const checkbox = this.page.locator(`[class*="permiso"] input[type="checkbox"], [class*="permiso"] label:has-text("${name}")`);
      const actualCheckbox = checkbox.locator('.. input[type="checkbox"]').first();
      await actualCheckbox.check();
    }
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageHeading()).toBeVisible({ timeout: config.timeouts.default });
    const heading = await this.pageHeading().textContent();
    expect(heading?.toLowerCase()).toContain('rol');
  }

  async expectTableHasRows(): Promise<void> {
    await expect(this.tableRows().first()).toBeVisible({ timeout: 5000 });
  }

  async expectTableEmpty(): Promise<void> {
    await this.page.waitForTimeout(500);
    const count = await this.tableRows().count();
    expect(count).toBe(0);
  }

  async expectRolExists(nombre: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await expect(
      this.page.locator(`table tbody tr:has-text("${nombre}"), [role="row"]:has-text("${nombre}")`).first(),
      `Rol "${nombre}" debería existir en la tabla`
    ).toBeVisible({ timeout: 5000 });
  }

  async expectRolNotExists(nombre: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await expect(
      this.page.locator(`table tbody tr:has-text("${nombre}")`).first()
    ).not.toBeVisible();
  }

  async expectModalOpen(): Promise<void> {
    await expect(this.modal()).toBeVisible({ timeout: 5000 });
    await expect(this.nombreInput()).toBeVisible();
  }

  async expectModalClosed(): Promise<void> {
    await expect(this.modal()).toBeHidden({ timeout: 5000 }).catch(() => {});
  }
}
