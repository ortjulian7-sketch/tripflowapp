import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/Input'
import { ListItem } from '@/components/ListItem'
import type { Categoria } from '@/lib/db'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { useCategories } from '@/features/categories/useCategories'
import { crearCategoria, eliminarCategoria, renombrarCategoria } from '@/features/categories/categoryRepository'

const EMOJI_POR_DEFECTO = '🏷️'

export function CategoriasPage() {
  const { userId } = useIdentity()
  const categorias = useCategories(userId)

  const [nuevoNombre, setNuevoNombre] = useState('')
  const [errorCrear, setErrorCrear] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [errorEditar, setErrorEditar] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)

  async function handleCrear(event: FormEvent) {
    event.preventDefault()
    setErrorCrear(null)
    setCreando(true)
    try {
      await crearCategoria(userId, nuevoNombre, EMOJI_POR_DEFECTO)
      setNuevoNombre('')
    } catch (error) {
      setErrorCrear(error instanceof Error ? error.message : 'No pudimos crear la categoría.')
    } finally {
      setCreando(false)
    }
  }

  function empezarEdicion(categoria: Categoria) {
    setEditandoId(categoria.id)
    setNombreEditado(categoria.nombre)
    setErrorEditar(null)
  }

  async function handleRenombrar(event: FormEvent) {
    event.preventDefault()
    if (!editandoId) return
    setErrorEditar(null)
    setGuardando(true)
    try {
      await renombrarCategoria(editandoId, nombreEditado)
      setEditandoId(null)
    } catch (error) {
      setErrorEditar(error instanceof Error ? error.message : 'No pudimos renombrar la categoría.')
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
      <h1 className="text-xl font-semibold text-text-primary">Categorías</h1>

      <div className="flex flex-col gap-1">
        {categorias?.map((categoria) =>
          editandoId === categoria.id ? (
            <form
              key={categoria.id}
              onSubmit={handleRenombrar}
              className="flex flex-col gap-2 px-2 py-1.5"
            >
              <Input
                type="text"
                label="Nombre"
                showLabel={false}
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                error={errorEditar ?? undefined}
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setEditandoId(null)}>
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  Guardar
                </Button>
              </div>
            </form>
          ) : (
            <ListItem
              key={categoria.id}
              emoji={categoria.emoji}
              title={categoria.nombre}
              onClick={() => empezarEdicion(categoria)}
              trailingIcon={categoria.protegida ? undefined : 'trash'}
              trailingIconLabel="Eliminar categoría"
              onTrailingClick={() => {
                setErrorEliminar(null)
                setCategoriaAEliminar(categoria)
              }}
            />
          ),
        )}
      </div>

      <form
        onSubmit={handleCrear}
        className="flex flex-col gap-3 border-t border-surface-secondary pt-4"
      >
        <Input
          type="text"
          label="Nueva categoría"
          placeholder="Nombre de la categoría"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          error={errorCrear ?? undefined}
        />
        <Button type="submit" loading={creando}>
          Agregar categoría
        </Button>
      </form>

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
