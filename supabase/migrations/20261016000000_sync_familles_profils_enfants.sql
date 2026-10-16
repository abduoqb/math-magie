-- Synchronisation Mathémagie : un compte "famille" (parent) possède des profils enfants.
--
-- Ce fichier est la trace versionnée de la migration appliquée au projet Supabase
-- uuxghhuhfeoposespbsk. Ne pas le rejouer sur ce projet : les tables existent déjà.
-- Pour recréer un projet vierge : exécuter ce fichier une seule fois.

create table public.familles (
  famille_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  code_parent jsonb,
  maj_le timestamptz not null default now()
);

create table public.profils_enfants (
  id uuid primary key default gen_random_uuid(),
  famille_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  prenom text not null check (char_length(prenom) between 1 and 30),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  version integer not null default 1,
  supprime_le timestamptz,
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now(),
  unique (famille_id, prenom)
);

-- Version, date de mise à jour et propriétaire immuables, gérés côté base
create function public.profils_enfants_avant_maj()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.famille_id := old.famille_id;
  new.id := old.id;
  new.cree_le := old.cree_le;
  new.version := old.version + 1;
  new.maj_le := now();
  return new;
end;
$$;

create trigger profils_enfants_avant_maj
before update on public.profils_enfants
for each row execute function public.profils_enfants_avant_maj();

create function public.familles_avant_maj()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.famille_id := old.famille_id;
  new.maj_le := now();
  return new;
end;
$$;

create trigger familles_avant_maj
before update on public.familles
for each row execute function public.familles_avant_maj();

-- Sécurité : RLS, uniquement pour les utilisateurs connectés et leurs propres lignes
alter table public.familles enable row level security;
alter table public.profils_enfants enable row level security;

revoke all on public.familles from anon, public;
revoke all on public.profils_enfants from anon, public;
grant select, insert, update, delete on public.familles to authenticated;
grant select, insert, update, delete on public.profils_enfants to authenticated;

create policy familles_lecture on public.familles
  for select to authenticated using (famille_id = (select auth.uid()));
create policy familles_creation on public.familles
  for insert to authenticated with check (famille_id = (select auth.uid()));
create policy familles_maj on public.familles
  for update to authenticated
  using (famille_id = (select auth.uid())) with check (famille_id = (select auth.uid()));
create policy familles_suppression on public.familles
  for delete to authenticated using (famille_id = (select auth.uid()));

create policy profils_lecture on public.profils_enfants
  for select to authenticated using (famille_id = (select auth.uid()));
create policy profils_creation on public.profils_enfants
  for insert to authenticated with check (famille_id = (select auth.uid()));
create policy profils_maj on public.profils_enfants
  for update to authenticated
  using (famille_id = (select auth.uid())) with check (famille_id = (select auth.uid()));
create policy profils_suppression on public.profils_enfants
  for delete to authenticated using (famille_id = (select auth.uid()));
