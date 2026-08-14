import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmojiPicker } from '@/components/EmojiPicker'
import { Input } from '@/components/Input'
import { ListItem } from '@/components/ListItem'
import { Modal } from '@/components/Modal'
import type { Categoria } from '@/lib/db'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { useCategories } from '@/features/categories/useCategories'
import { crearCategoria, editarCategoria, eliminarCategoria } from '@/features/categories/categoryRepository'

const EMOJI_POR_DEFECTO = '🏷️'

export function CategoriasPage() {
  const { userId } = useIdentity()
  const categorias = useCategories(userId!)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_POR_DEFECTO)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)

  function abrirCrear() {
    setEditandoId(null)
    setNombre('')
    setEmoji(EMOJI_POR_DEFECTO)
    setError(null)
    setModalAbierto(true)
  }

  function abrirEdicion(categoria: Categoria) {
    setEditandoId(categoria.id)
    setNombre(categoria.nombre)
    setEmoji(categoria.emoji)
    setError(null)
    setModalAbierto(true)
  }

  async function handleGuardar(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      if (editandoId) {
        await editarCategoria(editandoId, nombre, emoji)
      } else {
        await crearCategoria(userId!, nombre, emoji)
      }
      setModalAbierto(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No pudimos guardar la categoría.')
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarEliminacion() {
    if (!categoriaAEliminar) return
    setErrorEliminar(null)
    setEliminando(true)
    try {
      await eliminarCategoria(categoriaAEliminar.id)
      setCategoriaAEliminar(null)
    } catch (error) {
      // El diálogo permanece abierto mostrando el motivo del bloqueo (FR-028).
      setErrorEliminar(
        error instanceof Error ? error.message : 'No pudimos eliminar la categoría.',
      )
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text-primary">Categorías</h1>
        <Button size="medium" icon="plus" onClick={abrirCrear}>
          Nueva
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        {categorias?.map((categoria) => (
          <ListItem
            key={categoria.id}
            emoji={categoria.emoji}
            title={categoria.nombre}
            onClick={() => abrirEdicion(categoria)}
            trailingIcon={categoria.protegida ? undefined : 'trash'}
            trailingIconLabel="Eliminar categoría"
            onTrailingClick={() => {
              setErrorEliminar(null)
              setCategoriaAEliminar(categoria)
            }}
          />
        ))}
      </div>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={editandoId ? 'Editar categoría' : 'Nueva categoría'}
      >
        <form onSubmit={handleGuardar} className="flex flex-col gap-4">
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
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              {editandoId ? 'Guardar cambios' : 'Agregar categoría'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={categoriaAEliminar !== null}
        title="Eliminar categoría"
        description={
          errorEliminar ??
          `Esta acción es permanente: se va a borrar "${categoriaAEliminar?.nombre}" y no se puede deshacer.`
        }
        onCancel={() => setCategoriaAEliminar(null)}
        onConfirm={confirmarEliminacion}
        loading={eliminando}
      />
    </div>
  )
}
