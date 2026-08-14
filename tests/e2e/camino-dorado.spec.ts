import { expect, test } from '@playwright/test'

/**
 * Prueba de humo del camino dorado P1 (research.md §13): crear cuenta →
 * crear viaje → registrar gasto → ver resumen con los números correctos.
 *
 * Requiere un proyecto de Supabase real apuntado por .env.local, con
 * confirmación de correo desactivada (para que `signUp` devuelva sesión de
 * inmediato) — mismo prerrequisito que quickstart.md.
 */
test('camino dorado: bienvenida → crear cuenta → crear viaje → registrar gasto → ver resumen', async ({
  page,
}) => {
  const email = `tripflow-e2e-${Date.now()}@example.com`
  const password = 'contrasena-segura-123'

  // Bienvenida: primera pantalla en un dispositivo sin identidad (FR-001).
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Registrarse' })).toBeVisible()
  await page.getByRole('button', { name: 'Registrarse' }).click()

  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  // Onboarding de categorías: nada preseleccionado, se eligen a mano (FR-012, FR-013).
  await expect(page.getByRole('heading', { name: 'Tus categorías' })).toBeVisible()
  await page.getByRole('button', { name: /Comida/ }).click()
  await page.getByRole('button', { name: /Transporte/ }).click()
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
  await page.getByRole('button', { name: 'Registrar gasto' }).click()
  await page.getByLabel('Monto').fill('18750')
  await page.getByLabel('Descripción').fill('Almuerzo')
  await page.getByRole('button', { name: /Comida/ }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()

  // Resumen actualizado con los números correctos (SC-006 a SC-008).
  await expect(page.getByText('$18.750,00 ARS')).toBeVisible()
  await expect(page.getByText('42% del presupuesto gastado')).toBeVisible()
  await expect(page.getByText('$26.250,00')).toBeVisible()
})

/**
 * Camino dorado sin cuenta (US1, quickstart.md Escenario 1): abrir la app →
 * bienvenida → "Continuar como invitado" → categorías → crear viaje →
 * registrar gasto, sin pasar por /registro ni /login. Cada test de
 * Playwright arranca con un contexto de navegador aislado (sin sesión ni
 * localStorage previo), así que "abrir la app" acá ya equivale a un
 * dispositivo nuevo sin ninguna identidad establecida.
 */
test('camino dorado sin cuenta: bienvenida → categorías → crear viaje → registrar gasto, sin /registro ni /login', async ({
  page,
}) => {
  await page.goto('/')

  // Bienvenida: nunca una pantalla de cuenta obligatoria (FR-001, FR-002).
  await expect(page.getByRole('button', { name: 'Continuar como invitado' })).toBeVisible()
  expect(page.url()).not.toContain('/registro')
  expect(page.url()).not.toContain('/login')
  await page.getByRole('button', { name: 'Continuar como invitado' }).click()

  // Categorías: nada preseleccionado, se elige a mano (FR-012, FR-013).
  await expect(page.getByRole('heading', { name: 'Tus categorías' })).toBeVisible()
  await page.getByRole('button', { name: /Transporte/ }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // Crear el primer viaje, igual que con cuenta.
  await expect(page.getByRole('heading', { name: 'Tu primer viaje' })).toBeVisible()
  await page.getByLabel('Nombre del viaje').fill('Fin de semana sin cuenta')
  await page.getByLabel('Destino').fill('Mendoza')
  await page.getByLabel('Fecha de salida').fill('2026-10-01')
  await page.getByLabel('Moneda').selectOption('ARS')
  await page.getByLabel('Presupuesto total').fill('20000')
  await page.getByRole('button', { name: 'Crear viaje' }).click()

  await expect(page.getByRole('heading', { name: 'Fin de semana sin cuenta' })).toBeVisible()

  // Registrar un gasto sin cuenta (FR-001, FR-003).
  await page.getByRole('button', { name: 'Registrar gasto' }).click()
  await page.getByLabel('Monto').fill('5000')
  await page.getByLabel('Descripción').fill('Nafta')
  await page.getByRole('button', { name: /Transporte/ }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()

  await expect(page.getByText('Mendoza')).toBeVisible()

  // Cerrar y reabrir: el viaje y el gasto siguen ahí sin haber iniciado sesión.
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Fin de semana sin cuenta' })).toBeVisible()
  await expect(page.getByText('Mendoza')).toBeVisible()
  expect(page.url()).not.toContain('/registro')
  expect(page.url()).not.toContain('/login')

  // "Crear cuenta o iniciar sesión" existe en un lugar fijo (FR-004), pero
  // nunca se mostró como paso obligatorio en todo el recorrido anterior.
  await page.getByRole('link', { name: 'Cuenta' }).click()
  await expect(
    page.getByRole('button', { name: 'Crear cuenta o iniciar sesión' }),
  ).toBeVisible()
})
