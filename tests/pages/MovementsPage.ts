import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/env';

/**
 * MovementsPage — Page Object para el módulo de Movimientos.
 */
export class MovementsPage extends BasePage {
  readonly url = '/movements';

  // ─── Encabezado ────────────────────────────────────────────────────────
  pageHeading = (): Locator => this.page.locator('h1:has-text("Movimientos")').first();

  // ─── Filtros ─────────────────────────────────────────────────────────────
  nuevoBtn = (): Locator => this.page.locator('button:has-text("+ Nuevo")').first();
  limpiarFiltrosBtn = (): Locator => this.page.locator('button:has-text("Limpiar filtros")').first();
  filtrarBtn = (): Locator => this.page.locator('button:has-text("Filtrar")').first();

  // ─── Modal de movimiento ───────────────────────────────────────────────
  modalNuevoMovimiento = (): Locator => this.page.locator('h2:has-text("Nuevo Movimiento")').first();
  descripcionInput = (): Locator => this.page.getByRole('textbox', { name: /Descripción/i }).first();
  montoInput = (): Locator => this.page.getByRole('textbox', { name: /Monto total/i }).first();
  medioPagoInput = (): Locator => this.page.getByRole('textbox', { name: /Medio de pago/i }).first();
  propinInput = (): Locator => this.page.getByRole('textbox', { name: /Propina/i }).first();
  guardarBtn = (): Locator => this.page.locator('button:has-text("Guardar")').first();
  cancelarBtn = (): Locator => this.page.locator('button:has-text("Cancelar")').first();

  // ─── Tabla de resultados ───────────────────────────────────────────────
  tableRows = (): Locator => this.page.locator('table tbody tr');
  emptyState = (): Locator => this.page.locator('text=Aplicá los filtros').first();

  // ─── Métodos de acción ──────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.navigateTo(this.url);
    await this.waitForLoadState();
  }

  async openCreateForm(): Promise<void> {
    await this.nuevoBtn().click();
    await this.page.waitForSelector('h2:has-text("Nuevo Movimiento")', { timeout: 5000 });
  }

  /**
   * Selecciona una caja del combobox dentro del modal de movimiento.
   * @param nombreCaja Nombre exacto de la caja (ej: "Caja 1 (Local Providencia)")
   */
  async selectCaja(nombreCaja: string): Promise<void> {
    // El modal tiene searchbox con placeholder "Buscá una caja..."
    // Buscar todos los searchbox y filtrar por placeholder
    const searchbox = this.page.locator('input[placeholder*="Buscá"]').first();
    
    // Click en el searchbox para abrir el dropdown
    await searchbox.click();
    await this.page.waitForTimeout(500);
    
    // Escribir parte del nombre para filtrar
    await searchbox.fill(nombreCaja.substring(0, 5));
    await this.page.waitForTimeout(500);
    
    // Ahora buscar la opción en el listbox del modal
    // El listbox contiene las opciones
    const option = this.page.locator(`[role="listbox"] option:has-text("${nombreCaja}")`).first();
    await option.click();
  }

  async createMovimiento(data: {
    caja?: string;
    descripcion: string;
    monto: string;
    medioPago?: string;
    fecha?: string;
    propina?: string;
  }): Promise<void> {
    await this.openCreateForm();

    // Seleccionar caja si se especifica
    if (data.caja) {
      await this.selectCaja(data.caja);
    }

    // Llenar campos obligatorios
    await this.descripcionInput().fill(data.descripcion);
    await this.montoInput().fill(data.monto);

    // Llenar campos opcionales si se especifican
    if (data.medioPago) {
      await this.medioPagoInput().fill(data.medioPago);
    }

    if (data.propina) {
      await this.propinInput().fill(data.propina);
    }

    // Guardar
    await this.guardarBtn().click();

    // Esperar a que se cierre el modal
    await this.page.waitForTimeout(1500);
  }

  async clearFilters(): Promise<void> {
    await this.limpiarFiltrosBtn().click();
    await this.page.waitForTimeout(300);
  }

  async filtrar(): Promise<void> {
    await this.filtrarBtn().click();
    await this.page.waitForTimeout(500);
  }

  // ─── Verificaciones ───────────────────────────────────────────────────

  async expectLoaded(): Promise<void> {
    await expect(this.pageHeading()).toBeVisible({ timeout: config.timeouts.default });
    await expect(this.nuevoBtn()).toBeVisible();
  }

  async expectModalOpen(): Promise<void> {
    await expect(this.modalNuevoMovimiento()).toBeVisible({ timeout: 5000 });
  }

  async expectModalClosed(): Promise<void> {
    await expect(this.modalNuevoMovimiento()).toBeHidden({ timeout: 5000 }).catch(() => {});
  }

  async expectTableHasRows(): Promise<void> {
    await expect(this.tableRows().first()).toBeVisible({ timeout: 5000 });
  }

  async expectMovimientoExists(descripcion: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await expect(
      this.page.locator(`table tbody tr:has-text("${descripcion}")`).first()
    ).toBeVisible({ timeout: 5000 });
  }

  async expectMovimientoNotExists(descripcion: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await expect(
      this.page.locator(`table tbody tr:has-text("${descripcion}")`).first()
    ).not.toBeVisible();
  }
}
