-- HLO tracking schema for Supabase PostgreSQL
-- Run this in the Supabase SQL editor (new projects).
-- Existing projects: also run migration_hanz_reference.sql

create extension if not exists "pgcrypto";

create table if not exists public.shipment_ref_counters (
  day_key date primary key,
  last_seq integer not null default 0
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  hanz_reference text not null unique,
  awb text unique,
  tracking_number text unique,
  carrier text,
  origin text,
  destination text,
  status text,
  last_location text,
  last_updated timestamptz,
  created_at timestamptz not null default now(),
  constraint shipments_awb_or_legacy check (
    awb is not null or tracking_number is not null or hanz_reference is not null
  )
);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text,
  location text,
  description text,
  event_time timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists shipments_hanz_reference_idx
  on public.shipments (hanz_reference);

create index if not exists shipments_awb_idx
  on public.shipments (awb);

create index if not exists tracking_events_shipment_id_idx
  on public.tracking_events (shipment_id);

create index if not exists tracking_events_event_time_idx
  on public.tracking_events (event_time desc);
