# Supabase Setup Guide for FinNest

This guide will help you set up Supabase to handle Contact Support form submissions for your FinNest app.

## Prerequisites

- A Supabase account (free tier available at https://supabase.com)
- Node.js and npm installed
- FinNest project already set up

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the project details:
   - **Name**: FinNest (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., US East, EU West)
4. Click "Create new project"
5. Wait 1-2 minutes for project setup to complete

## Step 2: Create the Support Tickets Table

1. In your Supabase dashboard, go to **Table Editor** (left sidebar)
2. Click **"New Table"**
3. Configure the table:
   - **Name**: `support_tickets`
   - **Enable Row Level Security (RLS)**: ✅ Check this box

4. Add the following columns:

| Column Name  | Type        | Default Value            | Extra Settings          |
|--------------|-------------|--------------------------|-------------------------|
| id           | uuid        | gen_random_uuid()        | Primary, Identity       |
| created_at   | timestamptz | now()                    | -                       |
| updated_at   | timestamptz | now()                    | -                       |
| name         | text        | -                        | Not null                |
| email        | text        | -                        | Not null                |
| subject      | text        | -                        | Not null                |
| message      | text        | -                        | Not null                |
| status       | text        | 'open'                   | Not null                |

5. Click **"Save"** to create the table

## Step 3: Set Up Row Level Security (RLS) Policies

Since this is a public contact form, we need to allow anyone to insert support tickets:

1. Go to **Authentication > Policies** in the left sidebar
2. Find the `support_tickets` table
3. Click **"New Policy"**
4. Select **"Create a policy from scratch"**
5. Configure the policy:
   - **Policy Name**: `Allow public to insert support tickets`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `anon` (this is the public role)
   - **USING expression**: Leave as `true`
   - **WITH CHECK expression**: `true`
6. Click **"Save policy"**

7. Create another policy for your admin access:
   - **Policy Name**: `Allow service role to manage all tickets`
   - **Allowed operation**: `ALL`
   - **Target roles**: `authenticated`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
8. Click **"Save policy"**

## Step 4: Get Your API Credentials

1. Go to **Settings > API** (in the left sidebar)
2. Find and copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## Step 5: Configure Your FinNest App

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Important**: Make sure `.env` is in your `.gitignore` to keep credentials private!

## Step 6: Test the Integration

1. Restart your Expo development server:
   ```bash
   npm start
   ```

2. Open the app and go to **Profile > Contact Support**

3. Fill out the form and submit

4. Check your Supabase dashboard:
   - Go to **Table Editor > support_tickets**
   - You should see your test submission!

## Step 7: View and Manage Support Tickets

### Option 1: Supabase Dashboard
- Go to **Table Editor > support_tickets** to view all tickets
- You can edit, update status, or delete tickets directly

### Option 2: SQL Queries
Go to **SQL Editor** and run queries like:

```sql
-- Get all open tickets
SELECT * FROM support_tickets
WHERE status = 'open'
ORDER BY created_at DESC;

-- Update ticket status
UPDATE support_tickets
SET status = 'resolved', updated_at = now()
WHERE id = 'ticket-id-here';

-- Count tickets by status
SELECT status, COUNT(*)
FROM support_tickets
GROUP BY status;
```

## Step 8: (Optional) Set Up Email Notifications

To get notified when new tickets arrive:

1. Go to **Database > Webhooks**
2. Click **"Create a new webhook"**
3. Configure:
   - **Name**: New Support Ticket Notification
   - **Table**: support_tickets
   - **Events**: INSERT
   - **Type**: HTTP Request
   - **HTTP URL**: Your email service endpoint (e.g., Zapier, Make.com, or custom)

Or use **Supabase Edge Functions** to send emails via SendGrid/Mailgun when tickets are created.

## Troubleshooting

### "Failed to send message" error
- Check your internet connection
- Verify your `.env` file has correct Supabase credentials
- Make sure you've created the `support_tickets` table
- Check RLS policies are set up correctly

### Tickets not appearing in dashboard
- Refresh the Table Editor page
- Check the RLS policies allow INSERT for `anon` role
- Look at browser console for errors

### Environment variables not loading
- Restart your Expo dev server after changing `.env`
- Make sure variables start with `EXPO_PUBLIC_`
- Check `.env` is in the project root directory

## Security Notes

- ✅ The `anon` key is safe to use in client-side code
- ✅ RLS policies protect your database from unauthorized access
- ✅ Only INSERT operations are allowed from the app
- ✅ Your service role key should NEVER be in client code
- ✅ Consider adding rate limiting for production

## Scaling Considerations

For 100K+ users:
- **Free tier**: 500MB database, 50K monthly active users
- **Pro tier**: $25/month for 8GB database (handles millions of tickets)
- Add indexes on commonly queried columns:
  ```sql
  CREATE INDEX idx_support_tickets_status ON support_tickets(status);
  CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
  CREATE INDEX idx_support_tickets_email ON support_tickets(email);
  ```

## Next Steps

1. ✅ Test the contact form thoroughly
2. ✅ Set up email notifications
3. ✅ Create a support ticket dashboard (optional)
4. ✅ Add ticket status updates
5. ✅ Monitor usage in Supabase dashboard

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- FinNest Issues: https://github.com/yourrepo/issues
