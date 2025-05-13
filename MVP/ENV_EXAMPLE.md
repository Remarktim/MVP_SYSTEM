# Environment Variables for Vercel Deployment

When deploying to Vercel, you'll need to configure the following environment variables in your Vercel project settings:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

These values should match your Supabase project settings. Do not share your service role key publicly.
