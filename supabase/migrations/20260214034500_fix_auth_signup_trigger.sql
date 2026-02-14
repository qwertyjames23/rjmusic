-- Fix auth signup pipeline by enforcing a safe profiles insert trigger.
-- This avoids failures from legacy or mismatched trigger/function definitions.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, created_at)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
