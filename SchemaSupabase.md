## Database Schema

This document defines the core tables for the class booking system.

### Class Bookings Table

```sql
create table public.class_bookings (
  id serial not null,
  schedule_id integer not null,
  user_id uuid not null,
  booked_at timestamp with time zone null default CURRENT_TIMESTAMP,
  cancelled_at timestamp with time zone null,
  booking_status character varying(20) not null default 'confirmed'::character varying,
  constraint class_bookings_pkey primary key (id),
  constraint class_bookings_schedule_id_fkey foreign KEY (schedule_id) references class_schedules (id) on delete CASCADE,
  constraint class_bookings_user_id_fkey foreign KEY (user_id) references member (member_id) on delete CASCADE,
  constraint class_bookings_booking_status_check check (
    (
      (booking_status)::text = any (
        (
          array[
            'confirmed'::character varying,
            'cancelled'::character varying,
            'completed'::character varying,
            'no_show'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create unique INDEX IF not exists unique_active_booking on public.class_bookings using btree (schedule_id, user_id) TABLESPACE pg_default
where
  (cancelled_at is null);
```

### Class Table

```sql
create table public.class (
  class_id serial not null,
  class_name character varying(100) not null,
  description text null,
  difficulty character varying(20) not null,
  type character varying(50) not null,
  premium_status character varying(20) not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint class_pkey primary key (class_id),
  constraint class_class_name_key unique (class_name),
  constraint class_premium_status_check check (
    (
      (premium_status)::text = any (
        (
          array[
            'basic'::character varying,
            'premium'::character varying,
            'vip'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;
```

### Class Schedules Table

```sql
create table public.class_schedules (
  id serial not null,
  class_id integer not null,
  scheduled_date date null default CURRENT_DATE,
  time_from time without time zone not null,
  time_to time without time zone not null,
  trainer character varying(100) not null,
  total_spots integer null default 20,
  taken_spots integer null default 0,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  duration interval GENERATED ALWAYS as ((time_to - time_from)) STORED null,
  constraint class_schedules_pkey primary key (id),
  constraint class_schedules_class_id_fkey foreign KEY (class_id) references class (class_id) on delete RESTRICT,
  constraint valid_capacity check (
    (
      (taken_spots >= 0)
      and (taken_spots <= total_spots)
    )
  )
) TABLESPACE pg_default;
```

### Member Table

```sql
create table public.member (
  member_id uuid not null default gen_random_uuid (),
  first_name character varying(100) not null,
  last_name character varying(100) not null,
  member_status character varying(20) not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint member_pkey primary key (member_id),
  constraint member_member_status_check check (
    (
      (member_status)::text = any (
        (
          array[
            'basic'::character varying,
            'premium'::character varying,
            'vip'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;
```