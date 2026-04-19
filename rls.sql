-- 1. Enable  policies
alter table public.decisions enable row level security;

-- 2. Policy 
create policy "enforce_write_strict"
on public.decisions
for insert, update
to authenticated
with check (
  owner_id = (select auth.uid())
  and requires_approval = true
  and approval_deadline is not null
  
  and evidence is not null 
  and jsonb_typeof(evidence) = 'object'
  and length(evidence::text) <= 10000
  and evidence::text !~ '(?i)(passportphone|birth)' 
  
  and decision in ('APPROVED', 'REJECTED', 'ESCALATED')
  and outcome in ('CLOSED_SUCCESS', 'CLOSED_FAIL', 'PENDING')
  and (status != 'CLOSED' or outcome is not null)
);

-- function للـ closeout الإضافي
create or replace function enforce_closeout()
returns trigger as $$
begin
  if new.status = 'CLOSED' and new.outcome is null then
    raise exception 'Closeout requires outcome + evidence JSON' using errcode = '23514';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_closeout before update on decisions
for each row execute function enforce_closeout();