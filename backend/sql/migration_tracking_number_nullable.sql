-- Allow Hanz shipments without a carrier AWB.
-- Legacy schema required tracking_number NOT NULL; Hanz references can exist before an AWB is assigned.

alter table public.shipments
  alter column tracking_number drop not null;
