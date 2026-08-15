import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { EmojiPicker } from '@/components/EmojiPicker'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import type { Categoria } from '@/lib/db'
import { crearCategoria } from '@/features/categories/categoryRepository'

const EMOJI_POR_DEFECTO = '🏷️'

interface NuevaCategoriaModalProps {
  open: boolean
  userId: string
  onClose: () => void
  onCreada: (categoria: Categoria) => void
}

/** Crear una categoría sin salir del formulario de gasto (reduce fricción). */
export function NuevaCategoriaModal({ open, userId, onClose, onCreada }: NuevaCategoriaModalProps) {
  const [nombre, setNombre] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_POR_DEFECTO)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function handleClose() {
    setNombre('')
    setEmoji(EMOJI_POR_DEFECTO)
    setError(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const categoria = await crearCategoria(userId, nombre, emoji)
      setNombre('')
      setEmoji(EMOJI_POR_DEFECTO)
      onCreada(categoria)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No pudimos crear la categoría.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nueva categoría">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="text"
          label="Nombre"
          placeholder="Nombre de la categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={error ?? undefined}
        />
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={guardando}>
            Agregar categoría
          </Button>
        </div>
      </form>
    </Modal>
  )
}
