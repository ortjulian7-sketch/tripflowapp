/** Traduce los mensajes de error más comunes de Supabase Auth al español LATAM (Principio II). */
export function traducirErrorAuth(mensaje: string): string {
  const normalizado = mensaje.toLowerCase()
  if (normalizado.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (normalizado.includes('already registered') || normalizado.includes('already exists')) {
    return 'Ya existe una cuenta con ese correo.'
  }
  if (normalizado.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (normalizado.includes('unable to validate email') || normalizado.includes('invalid email')) {
    return 'Ese correo no es válido.'
  }
  if (normalizado.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.'
  }
  return 'Ocurrió un error. Intenta de nuevo.'
}
