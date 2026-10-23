-- ============================================================================
-- NUTRIQ (Smart Daily Plate) - Production Database Schema (Supabase / Postgres)
-- Architecture: Local-First with Cryptographic Cloud Sync & Zero-Trust RLS
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CUSTOM ENUMS
create type public.subscription_tier as enum ('free', 'pro_monthly', 'pro_annual');
create type public.subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'expired');
create type public.nutrition_goal as enum ('lose_weight', 'recomp', 'maintain', 'gain');
create type public.weight_loss_pace as enum ('steady', 'fast');
create type public.meal_slot_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

-- ============================================================================
-- 3. PROFILES TABLE (User anthropometrics, goals & macro targets)
-- ============================================================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text default 'Користувач',
    phone text default '',
    gender text check (gender in ('female', 'male')) default 'female',
    age integer check (age between 10 and 120) default 29,
    weight_kg numeric(5,2) check (weight_kg between 30 and 350) default 70.0,
    height_cm numeric(5,2) check (height_cm between 100 and 250) default 160.0,
    activity_level text default 'moderate',
    goal public.nutrition_goal default 'lose_weight',
    pace public.weight_loss_pace default 'fast',
    target_calories integer not null default 1500,
    target_protein numeric(5,1) not null default 140.0,
    target_fat numeric(5,1) not null default 45.0,
    target_carbs numeric(5,1) not null default 135.0,
    preferred_language text default 'es',
    face_id_enabled boolean default false,
    pin_code_hash text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================================
-- 4. SUBSCRIPTIONS TABLE (Zero-Trust Anti-Piracy Server-Managed Store)
-- ============================================================================
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade unique,
    tier public.subscription_tier not null default 'free',
    status public.subscription_status not null default 'active',
    is_pro boolean generated always as (tier in ('pro_monthly', 'pro_annual') and status in ('active', 'trialing')) stored,
    trial_start timestamptz default now(),
    trial_end timestamptz default (now() + interval '7 days'),
    current_period_end timestamptz,
    stripe_customer_id text,
    stripe_subscription_id text,
    tamper_proof_token text, -- Cryptographic HMAC-SHA256 hash issued only by backend
    offline_grace_period_days integer default 7,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================================
-- 5. DAILY FOOD LOGS (Chronological Food Log, Grams, Cook-Loss)
-- ============================================================================
create table if not exists public.daily_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    log_date date not null default current_date,
    meal_slot public.meal_slot_type not null default 'lunch',
    scheduled_time text not null default '13:00',
    dish_id text,
    dish_name text not null,
    calories integer not null check (calories >= 0),
    protein numeric(5,1) not null default 0,
    fat numeric(5,1) not null default 0,
    carbs numeric(5,1) not null default 0,
    raw_weight_g numeric(6,1),
    cooked_weight_g numeric(6,1),
    cook_loss_factor numeric(4,2) default 0.75,
    is_eaten boolean not null default false,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_daily_logs_user_date on public.daily_logs(user_id, log_date);

-- ============================================================================
-- 6. WEIGHT LOGS (Water Filter & True Fat Trend)
-- ============================================================================
create table if not exists public.weight_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    weigh_date date not null default current_date,
    raw_weight_kg numeric(5,2) not null check (raw_weight_kg between 30 and 350),
    smoothed_fat_kg numeric(5,2) not null,
    is_water_spike boolean default false,
    sodium_carb_trigger boolean default false,
    created_at timestamptz not null default now(),
    unique(user_id, weigh_date)
);

create index if not exists idx_weight_logs_user on public.weight_logs(user_id, weigh_date desc);

-- ============================================================================
-- 7. GROCERY ITEMS (Smart Grocery List with Raw Cook-Loss Aggregation)
-- ============================================================================
create table if not exists public.grocery_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    category text not null default 'other',
    raw_quantity text,
    is_bought boolean not null default false,
    is_custom boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_grocery_items_user on public.grocery_items(user_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) - Ironclad Data Privacy & Anti-Tampering
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.daily_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.grocery_items enable row level security;

-- PROFILES Policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can delete their own profile"
    on public.profiles for delete
    using (auth.uid() = id);

-- SUBSCRIPTIONS Policies (Strict Zero-Trust: Users CANNOT edit their own subscription!)
create policy "Users can read their own subscription"
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- Note: No INSERT, UPDATE, or DELETE policy for normal users on subscriptions.
-- Only Supabase Service Role (via Webhooks from Stripe or App Store backend) has write access!

-- DAILY LOGS Policies
create policy "Users can CRUD their own daily logs"
    on public.daily_logs for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- WEIGHT LOGS Policies
create policy "Users can CRUD their own weight logs"
    on public.weight_logs for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- GROCERY ITEMS Policies
create policy "Users can CRUD their own grocery items"
    on public.grocery_items for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ============================================================================
-- 9. AUTOMATED TRIGGERS (Auto-provision Profile and Trial Subscription on Signup)
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
    -- 1. Create default profile
    insert into public.profiles (id, email, full_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', 'Користувач')
    );

    -- 2. Create initial subscription (Free with 7-day trial)
    insert into public.subscriptions (user_id, tier, status, trial_start, trial_end)
    values (
        new.id,
        'free',
        'trialing',
        now(),
        now() + interval '7 days'
    );

    return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Trigger for updated_at timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
    for each row execute procedure public.set_updated_at();

create trigger set_subscriptions_updated_at before update on public.subscriptions
    for each row execute procedure public.set_updated_at();

create trigger set_daily_logs_updated_at before update on public.daily_logs
    for each row execute procedure public.set_updated_at();

create trigger set_grocery_items_updated_at before update on public.grocery_items
    for each row execute procedure public.set_updated_at();
