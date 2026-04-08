-- Fix profiles RLS to allow auth signup trigger inserts
-- Context: new user signup failed with "Database error saving new user"

do $$
begin
  if to_regclass('public.profiles') is not null then
    drop policy if exists "profiles_insert_own_or_admin" on public.profiles;

    create policy "profiles_insert_own_admin_or_auth_trigger"
      on public.profiles
      for insert
      to public
      with check (
        id = auth.uid()
        or public.is_admin(auth.uid())
        or current_user = 'supabase_auth_admin'
        or current_user = 'postgres'
      );
  end if;
end $$;
