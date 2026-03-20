# Supabase Setup (Optional)

For auth, history sync, and leaderboard, run the migration in your Supabase project:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Copy the contents of `supabase/migrations/001_quiz_schema.sql`
3. Run the SQL
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

The app works without Supabase (localStorage persistence only). With Supabase configured:
- Quiz attempts sync to the cloud
- Leaderboard shows top scores
- Auth supports Sign Up / Sign In
