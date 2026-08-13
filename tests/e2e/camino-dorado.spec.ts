import { expect, test } from '@playwright/test'

/**
 * Prueba de humo del camino dorado P1 (research.md §13): crear cuenta →
 * crear viaje → registrar gasto → ver resumen con los números correctos.
 *
 * Requiere un proyecto de Supabase real apuntado por .env.local, con
 * confirmación de correo desactivada (para que `signUp` devuelva sesión de
 * inmediato) — mismo prerrequisito que quickstart.md.
 */
test('camino dorado: crear cuenta → crear viaje → registrar gasto → ver resumen', async ({
  page,
}) => {
  const email = `tripflow-e2e-${Date.now()}@example.com`
  const password = 'contrasena-segura-123'

  await page.goto('/registro')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  // Onboarding de categorías: todo preseleccionado, solo continuar (FR-003).
  await expect(page.getByRole('heading', { name: 'Tus categorías' })).toBeVisible()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // Crear el primer viaje.
  await expect(page.getByRole('heading', { name: 'Tu primer viaje' })).toBeVisible()
  await page.getByLabel('Nombre del viaje').fill('Vacaciones de prueba')
  await page.getByLabel('Destino').fill('Bariloche')
  await page.getByLabel('Fecha de salida').fill('2026-09-01')
  await page.getByLabel('Moneda').selectOption('ARS')
  await page.getByLabel('Presupuesto total').fill('45000')
  await page.getByRole('button', { name: 'Crear viaje' }).click()

  // Resumen: el viaje recién creado queda visible.
  await expect(page.getByRole('heading', { name: 'Vacaciones de prueba' })).toBeVisible()
  await expect(page.getByText('Bariloche')).toBeVisible()

  // Registrar un gasto.
  await page.getByRole('button', { name: 'Nuevo gasto' }).click()
  await page.getByLabel('Monto').fill('18750')
  await page.getByLabel('Descripción').fill('Almuerzo')
  await page.getByRole('button', { name: /Comida/ }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()

  // Resumen actualizado con los números correctos (SC-006 a SC-008).
  await expect(page.getByText('$18.750,00 · 42%')).toBeVisible()
  await expect(page.getByText(/Disponible/)).toContainText('$26.250,00')
})
