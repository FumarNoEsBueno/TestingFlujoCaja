import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/env';

/**
 * DashboardPage — Page Object para el dashboard principal.
 */
export class DashboardPage extends BasePage {
  readonly url = '/dashboard';

  pageHeading = (): Locator => this.page.locator('h1').first();
  sidebar = (): Locator => this.page.locator('nav, aside, [class*="sidebar"], [class*="menu"]').first();

  // El usuario está en un link, no en un button
  userMenuLink = (): Locator => this.page.locator('a:has-text("Manuel Pereira")').first();

  // Botón de logout
  logoutButton = (): Locator => this.page.locator('button:has-text("Cerrar sesión")').first();

  sidebarLinks = (): Locator => this.page.locator('nav a, aside a, [class*="sidebar"] a').first();

  async goto(): Promise<void> {
    await this.navigateTo(this.url);
    await this.waitForLoadState();
  }

  async logout(): Promise<void> {
    // Usar dispatchEvent para trigger Angular
    await this.page.locator('button:has-text("Cerrar sesión")').dispatchEvent('click');
    await this.page.waitForTimeout(1000);
  }

  async navigateToModule(moduleName: string): Promise<void> {
    const moduleLink = this.page.locator(`nav a:has-text("${moduleName}"), aside a:has-text("${moduleName}")`).first();
    await moduleLink.click();
    await this.waitForLoadState();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageHeading()).toBeVisible({ timeout: config.timeouts.default });
    const heading = await this.pageHeading().textContent();
    expect(heading?.toLowerCase()).toContain('dashboard');
  }

  async expectUserNameVisible(expectedName: string): Promise<void> {
    await expect(this.page.locator(`a:has-text("${expectedName}")`).first()).toBeVisible();
  }

  async expectModulesVisible(modules: string[]): Promise<void> {
    // Verificar que el sidebar existe y contiene los enlaces esperados
    const sidebar = this.page.locator('nav').first();
    await expect(sidebar).toBeAttached();

    for (const module of modules) {
      const link = sidebar.locator(`a:has-text("${module}")`).first();
      await expect(link).toBeAttached();
    }
  }

  async expectSummaryCardsVisible(): Promise<void> {
    // Usar selectores más específicos para las tarjetas de resumen
    await expect(this.page.locator('text=Ventas Hoy')).toBeVisible();
    // "Movimientos" puede aparecer varias veces, usamos first()
    await expect(this.page.locator('p:has-text("Movimientos")').first()).toBeVisible();
    await expect(this.page.locator('text=Caja Actual')).toBeVisible();
    await expect(this.page.locator('text=Productos Hoy')).toBeVisible();
  }
}
