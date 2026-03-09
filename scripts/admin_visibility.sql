create table if not exists tour_visibility (
  key text primary key,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

-- optional: keep provider-level flags too
create table if not exists provider_visibility (
  company text primary key,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);
