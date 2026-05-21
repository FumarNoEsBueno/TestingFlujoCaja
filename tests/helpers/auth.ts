import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { config, backendUrl } from '../config/env';

/**
 * Helper de autenticación.
 * Provee métodos reutilizables para login/logout en toda la suite de tests.
 */
export class AuthHelper {
  private loginPage: LoginPage;
  private dashboardPage: DashboardPage;

  constructor(private readonly page: Page) {
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  /**
   * Limpia el storage del navegador para asegurar una sesión fresca.
   */
  async clearSession(): Promise<void> {
    try {
      await this.page.context().clearCookies();
      await this.page.evaluate(() => localStorage.clear());
    } catch {
      try {
        await this.page.context().clearCookies();
      } catch {
        // Ignorar
      }
    }
  }

  /**
   * Realiza login como administrador.
   */
  async loginAsAdmin(): Promise<void> {
    await this.clearSession();
    await this.loginPage.loginAsAdmin();
    await this.dashboardPage.expectLoaded();
  }

  /**
   * Realiza login como usuario estándar.
   */
  async loginAsUser(): Promise<void> {
    await this.clearSession();
    await this.loginPage.loginAsUser();
    await this.dashboardPage.expectLoaded();
  }

  /**
   * Realiza logout llamando la API del backend y limpiando el storage.
   */
  async logout(): Promise<void> {
    try {
      // Llamar la API de logout del backend
      await this.page.request.post(backendUrl('/auth/logout'), {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
      });
    } catch {
      // Si falla la API, continuar con limpieza local
    }

    // Limpiar storage local
    await this.clearSession();

    // Verificar que estamos en login
    await this.page.goto('/auth/login');
    await this.page.waitForTimeout(500);
  }

  /**
   * Obtiene el token JWT del localStorage.
   */
  private async getToken(): Promise<string> {
    return this.page.evaluate(() => {
      return localStorage.getItem('token') || '';
    });
  }

  /**
   * Asegura que el usuario está logueado antes de cada test.
   */
  async ensureAuthenticated(): Promise<void> {
    await this.clearSession();
    await this.loginAsAdmin();
  }
}
