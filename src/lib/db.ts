import Dexie, { type EntityTable } from 'dexie'

export interface Viaje {
  id: string
  user_id: string
  nombre: string
  destino: string
  fecha_salida: string // YYYY-MM-DD
  fecha_regreso: string | null // YYYY-MM-DD; null = viaje abierto
  presupuesto_total: number // unidad mínima de `moneda`
  moneda: string // código ISO 4217
  created_at: string
  updated_at: string
}

export interface Gasto {
  id: string
  trip_id: string
  categoria_id: string
  monto: number // unidad mínima de la moneda del viaje
  descripcion: string
  fecha: string // YYYY-MM-DD
  momento_registro: string // ISO datetime
  categoria_elegida_manualmente: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  user_id: string
  nombre: string
  emoji: string
  protegida: boolean
  created_at: string
  updated_at: string
}

export interface AsociacionAprendida {
  id: string
  user_id: string
  termino: string // normalizado: minúsculas, sin tildes
  categoria_id: string
  created_at: string
  updated_at: string
}

export type EntidadSync = 'viaje' | 'gasto' | 'categoria' | 'asociacion_aprendida'
export type OperacionSync = 'crear' | 'actualizar' | 'eliminar'

export interface CambioPendiente {
  id?: number // autoincremental local, no se sincroniza
  entidad: EntidadSync
  entidad_id: string
  operacion: OperacionSync
  intentado_at: string | null
}

class TripflowDB extends Dexie {
  viajes!: EntityTable<Viaje, 'id'>
  gastos!: EntityTable<Gasto, 'id'>
  categorias!: EntityTable<Categoria, 'id'>
  asociaciones_aprendidas!: EntityTable<AsociacionAprendida, 'id'>
  cambios_pendientes!: EntityTable<CambioPendiente, 'id'>

  constructor() {
    super('tripflow')
    this.version(1).stores({
      viajes: 'id, user_id, fecha_salida, fecha_regreso',
      gastos: 'id, trip_id, fecha, categoria_id',
      categorias: 'id, user_id, nombre',
      asociaciones_aprendidas: 'id, user_id, termino, categoria_id, [user_id+termino]',
      cambios_pendientes: '++id, entidad, entidad_id, operacion',
    })
  }
}

export const db = new TripflowDB()
