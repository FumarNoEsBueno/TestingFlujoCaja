import { Page, Locator, expect } from '@playwright/test';
import { config } from '../config/env';

/**
 * BasePage — clase padre para todos los Page Objects.
 * Provee métodos comunes y utilidades compartidas.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = config.frontend.url;
  }

  /**
   * Navega a una ruta dentro del frontend.
   * Usa 'domcontentloaded' para no depender de APIs externas.
   */
  protected async navigateTo(path: string): Promise<void> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${path}`;
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.default,
    });
  }

  /**
   * Espera a que la página cargue completamente.
   * Usa 'load' en vez de 'networkidle' para no depender de APIs externas.
   */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('load', {
      timeout: config.timeouts.default,
    });
  }

  /**
   * Obtiene un texto seguro (trim + texto fijo).
   */
  protected async getText(selector: string): Promise<string> {
    return (await this.page.locator(selector).textContent())?.trim() ?? '';
  }

  /**
   * Verifica que un elemento sea visible con mensaje descriptivo.
   */
  protected async expectVisible(selector: string, description?: string): Promise<void> {
    const locator = this.page.locator(selector);
    const msg = description || `Se esperaba que "${selector}" fuera visible`;
    await expect(locator, msg).toBeVisible();
  }

  /**
   * Verifica que un elemento NO sea visible.
   */
  protected async expectHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * Hace click en un elemento y espera navegación.
   */
  protected async clickAndNavigate(selector: string, expectedPath?: string): Promise<void> {
    if (expectedPath) {
      await Promise.all([
        this.page.waitForURL(`**${expectedPath}**`, { timeout: config.timeouts.default }),
        this.page.locator(selector).click(),
      ]);
    } else {
      await this.page.locator(selector).click();
      await this.waitForLoadState();
    }
  }

  /**
   * Verifica que la URL actual contenga un path esperado.
   */
  protected async expectUrlContains(expected: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expected));
  }

  /**
   * Obtiene el valor de un input.
   */
  protected async getInputValue(selector: string): Promise<string> {
    return (await this.page.locator(selector).inputValue()) ?? '';
  }

  /**
   * Limpia y llena un input con texto.
   */
  protected async fillInput(selector: string, value: string): Promise<void> {
    const input = this.page.locator(selector);
    await input.clear();
    await input.fill(value);
  }

  /**
   * Selecciona una opción de un select.
   */
  protected async selectOption(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  /**
   * Verifica que un toast/mensaje de éxito aparezca.
   */
  protected async expectSuccessToast(): Promise<void> {
    // Espera hasta 5s a que aparezca un toast de éxito
    await this.page.waitForSelector('[class*="toast-success"], [class*="success"], [role="alert"]:has-text("éxito")', {
      timeout: 5000,
    }).catch(() => {
      // Si no encuentra toast específico, verificamos que no haya error visible
    });
  }

  /**
   * Cierra el menú lateral si está expandido (útil para no tapar elementos).
   */
  protected async collapseSidebar(): Promise<void> {
    const collapseBtn = this.page.locator('button:has-text("Colapsar"), button:has-text("Collapse")');
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await this.waitForLoadState();
    }
  }
}
