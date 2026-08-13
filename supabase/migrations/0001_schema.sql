-- Tripflow v0 — esquema inicial (contracts/data-schema.md)
-- 4 tablas de negocio, todas con RLS por auth.uid() = user_id (directo o vía
-- el viaje/categoría dueños del registro). No existe ninguna otra tabla ni
-- función server-side en v0 salvo la Edge Function `delete-account`.

create extension if not exists "pgcrypto";

-- Se actualiza `updated_at` en cada UPDATE; es la marca que decide qué
-- versión de un registro prevalece al sincronizar (contracts/sync-contract.md).
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- viajes
-- ============================================================================

create table viajes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  destino text not null,
  fecha_salida date not null,
  fecha_regreso date,
  presupuesto_total integer not null check (presupuesto_total > 0),
  moneda text not null check (
    moneda in (
      'ARS', 'BOB', 'BRL', 'CLP', 'COP', 'CRC', 'DOP', 'GTQ', 'HNL', 'MXN',
      'NIO', 'PAB', 'PEN', 'PYG', 'UYU', 'VES', 'USD', 'EUR'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index viajes_user_id_idx on viajes (user_id);

alter table viajes enable row level security;

create policy "viajes: dueño lee y escribe" on viajes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger viajes_set_updated_at
  before update on viajes
  for each row
  execute function set_updated_at();

-- ============================================================================
-- categorias
-- ============================================================================

create table categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  emoji text not null,
  protegida boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, nombre)
);

create index categorias_user_id_idx on categorias (user_id);

alter table categorias enable row level security;

create policy "categorias: dueño lee y escribe" on categorias
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger categorias_set_updated_at
  before update on categorias
  for each row
  execute function set_updated_at();

-- ============================================================================
-- gastos
-- ============================================================================

create table gastos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references viajes (id) on delete cascade,
  categoria_id uuid not null references categorias (id) on delete restrict,
  monto integer not null check (monto > 0),
  descripcion text not null check (descripcion <> ''),
  fecha date not null,
  momento_registro timestamptz not null default now(),
  categoria_elegida_manualmente boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gastos_trip_id_idx on gastos (trip_id);
create index gastos_fecha_idx on gastos (fecha);
create index gastos_categoria_id_idx on gastos (categoria_id);

alter table gastos enable row level security;

-- RLS vía el viaje dueño del gasto (FR-012: aislamiento entre viajes/cuentas).
create policy "gastos: dueño del viaje lee y escribe" on gastos
  for all
  using (auth.uid() = (select user_id from viajes where id = trip_id))
  with check (auth.uid() = (select user_id from viajes where id = trip_id));

create trigger gastos_set_updated_at
  before update on gastos
  for each row
  execute function set_updated_at();

-- ============================================================================
-- asociaciones_aprendidas
-- ============================================================================

create table asociaciones_aprendidas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  termino text not null,
  categoria_id uuid not null references categorias (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, termino)
);

create index asociaciones_aprendidas_user_id_idx on asociaciones_aprendidas (user_id);
create index asociaciones_aprendidas_categoria_id_idx on asociaciones_aprendidas (categoria_id);

alter table asociaciones_aprendidas enable row level security;

create policy "asociaciones_aprendidas: dueño lee y escribe" on asociaciones_aprendidas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger asociaciones_aprendidas_set_updated_at
  before update on asociaciones_aprendidas
  for each row
  execute function set_updated_at();
