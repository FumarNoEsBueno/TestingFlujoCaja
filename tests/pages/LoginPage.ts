import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/env';

/**
 * LoginPage — Page Object para la página de login.
 * La URL real es /auth/login (Angular redirige /login → /auth/login).
 */
export class LoginPage extends BasePage {
  readonly url = '/auth/login';

  // ─── Locators (basados en el HTML real del formulario) ───────────────────
  // RUT: input con placeholder "12.345.678-9" y label "RUT *"
  rutInput = (): Locator => this.page.locator('input[placeholder*="12.345.678"], input[placeholder*="RUT"]').first();

  // Contraseña: input[type="password"] con placeholder "••••••••"
  passwordInput = (): Locator => this.page.locator('input[type="password"]').first();

  // Botón submit: "Iniciar Sesión"
  submitButton = (): Locator => this.page.locator('button:has-text("Iniciar")').first();

  // Mensaje de error (texto "Credenciales inválidas")
  errorMessage = (): Locator => this.page.locator('text=Credenciales inválidas').first();

  // ─── Métodos de acción ───────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.navigateTo(this.url);
    await this.waitForLoadState();
  }

  async loginAsAdmin(): Promise<void> {
    await this.login({
      rut: `${config.admin.rut}-${config.admin.dv}`,
      password: config.admin.password,
    });
  }

  async loginAsUser(): Promise<void> {
    await this.login({
      rut: `${config.user.rut}-${config.user.dv}`,
      password: config.user.password,
    });
  }

  async login(credentials: { rut: string; password: string }): Promise<void> {
    await this.goto();

    await this.rutInput().fill(credentials.rut);
    await this.passwordInput().fill(credentials.password);

    await Promise.all([
      this.page.waitForURL('**/dashboard**', { timeout: config.timeouts.default }),
      this.submitButton().click(),
    ]);
  }

  async loginWithInvalidCredentials(): Promise<void> {
    await this.goto();

    await this.rutInput().fill('00.000.000-0');
    await this.passwordInput().fill('wrongpassword');

    await this.submitButton().click();
    await this.page.waitForTimeout(1000);
  }

  // ─── Verificaciones ────────────────────────────────────────────────────

  async expectLoaded(): Promise<void> {
    await expect(this.rutInput()).toBeVisible({ timeout: config.timeouts.default });
    await expect(this.passwordInput()).toBeVisible();
    await expect(this.submitButton()).toBeVisible();
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.errorMessage()).toBeVisible({ timeout: 5000 });
    const text = await this.errorMessage().textContent();
    expect(
      text?.toLowerCase().includes('inválida') ||
      text?.toLowerCase().includes('incorrecta') ||
      text?.toLowerCase().includes('credencial') ||
      text?.toLowerCase().includes('error')
    ).toBeTruthy();
  }

  async expectLoginSuccess(): Promise<void> {
    await this.expectUrlContains('/dashboard');
    await expect(this.page.locator('text=Manuel Pereira').first()).toBeVisible({ timeout: 5000 });
  }

  async expectFormEmpty(): Promise<void> {
    await expect(await this.rutInput().inputValue()).toBe('');
    await expect(await this.passwordInput().inputValue()).toBe('');
  }
}
