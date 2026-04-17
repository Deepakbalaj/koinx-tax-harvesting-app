create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  submitted_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "service role can manage messages"
on public.messages
as permissive
for all
to service_role
using (true)
with check (true);
