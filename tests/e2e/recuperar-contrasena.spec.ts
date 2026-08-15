import { expect, test } from '@playwright/test'

const MENSAJE_CONFIRMACION =
  'Si el correo tiene una cuenta, te enviamos un enlace para recuperar tu contraseña.'

/**
 * Cubre el camino de User Story 1 que no dispara un envío real de correo:
 * un correo sin cuenta asociada (Supabase responde sin encolar ningún envío
 * — comportamiento documentado de anti-enumeración, ver research.md § 4).
 *
 * El camino con una cuenta existente SÍ hace que Supabase encole un envío
 * real, así que queda fuera de este suite automatizado a propósito (evitar
 * bounces repetidos contra buzones inventados) — se valida manualmente con
 * una cuenta y un correo reales (`quickstart.md` § Validar User Story 1).
 */
test('recuperar contraseña: pedir el enlace desde /login con un correo sin cuenta asociada', async ({
  page,
}) => {
  await page.goto('/login')

  // Enlace visible en Login (FR-001).
  const enlaceOlvidaste = page.getByRole('link', { name: '¿Olvidaste tu contraseña?' })
  await expect(enlaceOlvidaste).toBeVisible()
  await enlaceOlvidaste.click()
  await expect(page).toHaveURL(/\/recuperar-contrasena$/)

  // Correo sin cuenta asociada: Supabase no encola ningún envío para este
  // caso, así que es seguro repetir en cada corrida sin generar bounces
  // (FR-004, SC-003).
  await page.getByLabel('Correo').fill(`sin-cuenta-${Date.now()}@example.com`)
  await page.getByRole('button', { name: 'Enviar enlace' }).click()
  await expect(page.getByText(MENSAJE_CONFIRMACION)).toBeVisible()
})

/**
 * FR-008/SC-004: un enlace vencido o ya usado debe mostrar de inmediato el
 * mensaje correspondiente, nunca el formulario de contraseña nueva.
 */
test('recuperar contraseña: enlace vencido o usado no expone el formulario de contraseña', async ({
  page,
}) => {
  await page.goto('/recuperar-contrasena/confirmar#error=access_denied&error_code=otp_expired')

  await expect(
    page.getByText('Este enlace ya venció o ya se usó. Pide uno nuevo para continuar.'),
  ).toBeVisible()
  const enlaceNuevo = page.getByRole('link', { name: 'Pedir un enlace nuevo' })
  await expect(enlaceNuevo).toBeVisible()
  await expect(page.getByLabel('Contraseña nueva')).not.toBeVisible()

  await enlaceNuevo.click()
  await expect(page).toHaveURL(/\/recuperar-contrasena$/)
})
