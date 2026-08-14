import { Icon } from '@/components/Icon'

interface EmptySearchResultsProps {
  query: string
}

/** Sin coincidencias para la búsqueda activa (Figma node 213:2740 "EmptyNoResults"). */
export function EmptySearchResults({ query }: EmptySearchResultsProps) {
  return (
    <div className="flex flex-col items-center px-8 py-10 text-center">
      <div className="mb-3 flex size-20 items-center justify-center rounded-full border border-black/[0.06] bg-surface-elevated shadow-sm dark:border-white/[0.06]">
        <Icon name="search" size={32} strokeWidth={1.2} className="text-icon-secondary" />
      </div>
      <h3 className="font-brand text-xl font-semibold tracking-[-0.2px] text-text-primary">
        Sin resultados
      </h3>
      <p className="mt-1.5 w-[240px] text-sm leading-[22.4px] text-text-secondary">
        No encontramos gastos para{' '}
        <span className="font-semibold text-text-primary">&ldquo;{query}&rdquo;</span>. Intenta con
        otra búsqueda.
      </p>
    </div>
  )
}
