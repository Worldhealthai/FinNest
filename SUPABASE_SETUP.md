# Supabase Setup Guide for FinNest

This guide will help you set up Supabase backend for FinNest to store user authentication and ISA data.

## Step 1: Create a Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Enter project details:
   - **Name**: FinNest
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for it to initialize

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public** key (the `anon` `public` key under "Project API keys")

## Step 3: Add Credentials to Your App

Create a `.env` file in the root of your FinNest project:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Add `.env` to your `.gitignore` to keep credentials secure!

## Step 4: Set Up Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL scripts:

### Create Profiles Table

```sql
-- Create profiles table (extends Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  date_of_birth text,
  national_insurance_number text,
  phone_number text,
  profile_photo text,
  savings_goals text[],
  target_amount numeric,
  target_date text,
  notifications_tax_year_reminders boolean default true,
  notifications_contribution_streaks boolean default true,
  notifications_educational_tips boolean default true,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();
```

### Create Contributions Table

```sql
-- Create contributions table for ISA tracking
create table if not exists public.contributions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  isa_type text not null check (isa_type in ('cash', 'stocks_shares', 'lifetime', 'innovative_finance')),
  provider text not null,
  amount numeric not null check (amount > 0),
  date text not null,
  withdrawn boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.contributions enable row level security;

-- Create policies
create policy "Users can view own contributions"
  on public.contributions for select
  using (auth.uid() = user_id);

create policy "Users can insert own contributions"
  on public.contributions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own contributions"
  on public.contributions for update
  using (auth.uid() = user_id);

create policy "Users can delete own contributions"
  on public.contributions for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger set_updated_at
  before update on public.contributions
  for each row
  execute procedure public.handle_updated_at();

-- Create index for faster queries
create index contributions_user_id_idx on public.contributions(user_id);
create index contributions_date_idx on public.contributions(date);
```

### Create Automatic Profile Creation Trigger

```sql
-- Function to automatically create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Step 5: Configure Email Authentication (Optional but Recommended)

1. Go to **Authentication** > **Providers** in Supabase
2. Enable **Email** provider
3. Configure email templates if desired
4. For production, set up a custom SMTP server

## Step 6: Test the Setup

1. Restart your Expo app: `npm start`
2. Try signing up with a new account
3. Check the **Table Editor** in Supabase to verify:
   - User appears in **Authentication** > **Users**
   - Profile created in `profiles` table
   - Contributions saved in `contributions` table when you add ISAs

## Data Migration (Optional)

If you have existing users in AsyncStorage that you want to migrate to Supabase:

1. Users will need to sign up again (passwords weren't securely stored before)
2. You can create a migration script to move ISA contribution data if needed

## Security Best Practices

✅ **Row Level Security (RLS)** is enabled - users can only access their own data
✅ **Environment variables** keep API keys secure
✅ **Password hashing** is handled automatically by Supabase Auth
✅ **Session management** with automatic refresh tokens

## Troubleshooting

### "Supabase URL or Anon Key not found"
- Make sure `.env` file exists in project root
- Restart Expo with `npm start`
- Check environment variables are prefixed with `EXPO_PUBLIC_`

### "No rows returned" when querying data
- Check Row Level Security policies are set up correctly
- Verify user is authenticated before querying
- Check SQL Editor > Logs for error messages

### Email confirmation issues
- In development, check **Authentication** > **Users** and manually confirm email
- For production, configure email settings properly

## Need Help?

Check the Supabase documentation:
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
