-- Enable PostGIS for efficient geospatial queries
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- Add geohash support to existing profiles table
alter table public.profiles 
add column if not exists geohash text generated always as (
  case when location is not null
    then st_geohash(location::geometry, 7)
    else null
  end
) stored;

-- Add PostGIS location column if not exists
do $$
begin
  if not exists (select 1 from information_schema.columns 
                where table_name = 'profiles' and column_name = 'location') then
    alter table public.profiles 
    add column location geography(point, 4326);
  end if;
end $$;

-- Create spatial index for efficient nearby queries
create index if not exists idx_profiles_location on public.profiles using gist (location);

-- Create geohash index for clustering
create index if not exists idx_profiles_geohash on public.profiles (geohash);

-- Update existing profiles with location data
update public.profiles 
set location = ST_Point(longitude, latitude)::geography
where latitude is not null and longitude is not null and location is null;

-- Add travel mode support
alter table public.profiles 
add column if not exists travel_mode boolean not null default false,
add column if not exists travel_location geography(point, 4326);

-- Create nearby_profiles RPC function (PostGIS optimized)
create or replace function public.nearby_profiles(
  user_lat float,
  user_lng float,
  max_distance_km float default 50,
  limit_count int default 50
)
returns table (
  id uuid,
  username text,
  display_name text,
  bio text,
  avatar_url text,
  gallery_urls text[],
  age int,
  location geography(point, 4326),
  distance_km float,
  is_verified boolean,
  is_premium boolean,
  last_seen timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  user_point geography(point, 4326) := ST_Point(user_lng, user_lat)::geography;
begin
  return query
  select 
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.gallery_urls,
    p.age,
    p.location,
    round(ST_Distance(p.location, user_point)::float / 1000, 2) as distance_km,
    p.is_verified,
    p.is_premium,
    p.last_seen,
    p.created_at
  from public.profiles p
  where 
    p.location is not null
    and ST_DWithin(p.location, user_point, max_distance_km * 1000)
    and p.id != auth.uid()
    and p.age >= 18
  order by ST_Distance(p.location, user_point)
  limit limit_count;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.nearby_profiles to authenticated;

-- Add RLS policy for nearby_profiles function
create policy "Users can view nearby profiles"
on public.profiles for select
using (
  age >= 18 
  and id != auth.uid()
);

-- Create trigger to update geohash on location change
create or replace function public.update_geohash()
returns trigger language plpgsql security definer as $$
begin
  if new.location is not null then
    new.geohash := st_geohash(new.location::geometry, 7);
  else
    new.geohash := null;
  end if;
  return new;
end;
$$;

create trigger trigger_update_geohash
  before update of location on public.profiles
  for each row execute procedure public.update_geohash();

-- Add performance indexes
create index if not exists idx_profiles_age on public.profiles (age) where age >= 18;
create index if not exists idx_profiles_last_seen on public.profiles (last_seen desc);
create index if not exists idx_profiles_verified on public.profiles (is_verified) where is_verified = true;

-- Create location update function for real-time tracking
create or replace function public.update_user_location(
  lat float,
  lng float,
  accuracy float default 100
)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles 
  set 
    location = ST_Point(lng, lat)::geography,
    last_seen = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.update_user_location to authenticated;