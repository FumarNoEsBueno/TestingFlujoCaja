import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/env';

/**
 * UsuariosPage — Page Object para el módulo de administración de Usuarios.
 */
export class UsuariosPage extends BasePage {
  readonly url = '/users';

  pageHeading = (): Locator => this.page.locator('h1, h2, h3').first();
  createButton = (): Locator => this.page.locator('button:has-text("Crear"), button:has-text("Nuevo"), button:has-text("Agregar")').first();
  searchInput = (): Locator => this.page.locator('input[placeholder*="Buscar"], input[type="search"]').first();
  tableRows = (): Locator => this.page.locator('table tbody tr, [role="row"]');
  modal = (): Locator => this.page.locator('[role="dialog"], [class*="modal"]').first();
  nombreInput = (): Locator => this.page.locator('input[formcontrolname*="nombre"]').first();
  apellidoPInput = (): Locator => this.page.locator('input[formcontrolname*="apellido"]').first();
  rutInput = (): Locator => this.page.locator('input[formcontrolname*="rut"]').first();
  dvInput = (): Locator => this.page.locator('input[formcontrolname*="dv"]').first();
  emailInput = (): Locator => this.page.locator('input[formcontrolname*="correo"], input[type="email"]').first();
  passwordInput = (): Locator => this.page.locator('input[formcontrolname*="password"]').first();
  rolSelect = (): Locator => this.page.locator('select[formcontrolname*="rol"]').first();
  saveButton = (): Locator => this.page.locator('button:has-text("Guardar")').first();
  editButton = (): Locator => this.page.locator('button:has-text("Editar")').first();
  deleteButton = (): Locator => this.page.locator('button:has-text("Eliminar")').first();

  async goto(): Promise<void> {
    await this.navigateTo(this.url);
    await this.waitForLoadState();
    await this.page.waitForSelector('table, [role="table"]', { timeout: config.timeouts.default }).catch(() => {});
  }

  async openCreateForm(): Promise<void> {
    await this.createButton().click();
    await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  async createUsuario(data: {
    nombre: string;
    apellidoP: string;
    rut: string;
    dv: string;
    email?: string;
    password: string;
    rolId?: string;
  }): Promise<void> {
    await this.openCreateForm();

    await this.nombreInput().fill(data.nombre);
    await this.apellidoPInput().fill(data.apellidoP);
    await this.rutInput().fill(data.rut);
    await this.dvInput().fill(data.dv);
    if (data.email) await this.emailInput().fill(data.email);
    await this.passwordInput().fill(data.password);
    if (data.rolId) await this.rolSelect().selectOption(data.rolId);

    await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/api/usuarios') && resp.status() === 201, { timeout: 10000 }),
      this.saveButton().click(),
    ]);
    await this.waitForLoadState();
  }

  async searchUsuario(rut: string): Promise<void> {
    await this.searchInput().clear();
    await this.searchInput().fill(rut);
    await this.page.waitForTimeout(500);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageHeading()).toBeVisible({ timeout: config.timeouts.default });
  }

  async expectUsuarioExists(rut: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await expect(
      this.page.locator(`table tbody tr:has-text("${rut}")`).first()
    ).toBeVisible({ timeout: 5000 });
  }

  async expectUsuarioNotExists(rut: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await expect(
      this.page.locator(`table tbody tr:has-text("${rut}")`).first()
    ).not.toBeVisible();
  }
}
