import { expect, test } from '@playwright/test'

/**
 * Regresión: invitado → onboarding → categorías → resumen → Cuenta →
 * "Crear cuenta o iniciar sesión" → Crear cuenta. Antes del fix, `Bootstrap()`
 * no sacaba a la persona de /onboarding/intro una vez migradas sus
 * categorías de invitado, así que repetía el onboarding — y si volvía a
 * elegir una categoría ahí, `guardarSeleccionInicial` la creaba de nuevo sin
 * chequear duplicados.
 */
test('invitado que crea cuenta desde Cuenta no repite onboarding ni duplica categorías', async ({
  page,
}) => {
  const email = `tripflow-bugfix-${Date.now()}@example.com`
  const password = 'contrasena-segura-123'

  await page.goto('/')
  await page.getByRole('button', { name: 'Continuar como invitado' }).click()

  await page.getByRole('button', { name: 'Saltar' }).click()
  await expect(page.getByRole('heading', { name: 'Tus categorías' })).toBeVisible()
  await page.getByRole('button', { name: /Comida/ }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Tu primer viaje' })).toBeVisible()
  await page.getByLabel('Nombre del viaje').fill('Viaje bugfix')
  await page.getByLabel('Destino').fill('Salta')
  await page.getByLabel('Fecha de salida').fill('2026-09-01')
  await page.getByLabel('Moneda').selectOption('ARS')
  await page.getByLabel('Presupuesto total').fill('10000')
  await page.getByRole('button', { name: 'Crear viaje' }).click()
  await expect(page.getByRole('heading', { name: 'Viaje bugfix' })).toBeVisible()

  await page.getByRole('link', { name: 'Cuenta' }).click()
  await page.getByRole('button', { name: 'Crear cuenta o iniciar sesión' }).click()
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  // El invitado ya tiene un viaje guardado: confirmar que se incluya en la cuenta nueva.
  await expect(page.getByRole('dialog', { name: 'Viajes guardados en este dispositivo' })).toBeVisible()
  await page.getByRole('button', { name: 'Incluir' }).click()

  // No debería repetir el onboarding: debe volver directo al resumen del viaje.
  await expect(page.getByRole('heading', { name: 'Viaje bugfix' })).toBeVisible({ timeout: 10_000 })
  expect(page.url()).not.toContain('/onboarding')

  // Categorías no duplicadas: "Comida" y "Otro" deben aparecer una sola vez cada una.
  await page.getByRole('link', { name: 'Cuenta' }).click()
  await page.getByRole('button', { name: 'Categorías', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Categorías' })).toBeVisible()
  await expect(page.getByText('Comida', { exact: true })).toHaveCount(1)
  await expect(page.getByText('Otro', { exact: true })).toHaveCount(1)
})
