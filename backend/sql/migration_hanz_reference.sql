-- Migration: Hanz shipment reference system
-- Run in Supabase SQL editor on existing HLO databases.

create extension if not exists "pgcrypto";

create table if not exists public.shipment_ref_counters (
  day_key date primary key,
  last_seq integer not null default 0
);

alter table public.shipments
  add column if not exists hanz_reference text,
  add column if not exists awb text;

-- Backfill AWB from legacy tracking_number where needed.
update public.shipments
set awb = tracking_number
where awb is null
  and tracking_number is not null
  and tracking_number !~* '^HANZ-[0-9]{6}-[0-9]{4}$';

-- Backfill Hanz references for rows that do not yet have one.
do $$
declare
  r record;
  v_day_key date;
  v_seq integer;
  v_ref text;
begin
  for r in
    select id, created_at
    from public.shipments
    where hanz_reference is null
    order by created_at asc nulls last, id asc
  loop
    v_day_key := coalesce((r.created_at at time zone 'utc')::date, (now() at time zone 'utc')::date);
    insert into public.shipment_ref_counters (day_key, last_seq)
    values (v_day_key, 1)
    on conflict (day_key) do update
      set last_seq = public.shipment_ref_counters.last_seq + 1
    returning last_seq into v_seq;

    v_ref := 'HANZ-' || to_char(v_day_key, 'YYMMDD') || '-' || lpad(v_seq::text, 4, '0');
    update public.shipments set hanz_reference = v_ref where id = r.id;
  end loop;
end $$;

alter table public.shipments
  alter column hanz_reference set not null;

create unique index if not exists shipments_hanz_reference_key
  on public.shipments (hanz_reference);

create unique index if not exists shipments_awb_key
  on public.shipments (awb)
  where awb is not null;

create index if not exists shipments_hanz_reference_idx
  on public.shipments (hanz_reference);

create index if not exists shipments_awb_idx
  on public.shipments (awb);

-- Legacy installs: tracking_number was NOT NULL before Hanz references existed.
alter table public.shipments
  alter column tracking_number drop not null;
