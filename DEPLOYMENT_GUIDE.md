# Database Migration & Deployment Guide

## 🚨 Current Situation
You have a Phase 2A migration (design intelligence) that references tables from Phase 1 that don't exist yet. This guide will help you fix it.

---

## ✅ Step-by-Step Deployment

### **Step 1: Backup Current State (If Any Data Exists)**

```bash
# If you have any data in Supabase already, back it up first
# In Supabase Dashboard > Database > Backups
# Or export tables manually
```

### **Step 2: Reset Migrations (Clean Slate Approach)**

If you're in early development with no critical data:

```bash
# Option A: Reset in Supabase Dashboard
# 1. Go to Supabase Dashboard > Database
# 2. SQL Editor > New Query
# 3. Drop all Phase 2A tables:

DROP TABLE IF EXISTS moodboard_shares CASCADE;
DROP TABLE IF EXISTS moodboard_elements CASCADE;
DROP TABLE IF EXISTS moodboards CASCADE;
DROP TABLE IF EXISTS project_material_selections CASCADE;
DROP TABLE IF EXISTS material_library CASCADE;
DROP TABLE IF EXISTS project_color_selections CASCADE;
DROP TABLE IF EXISTS color_palettes CASCADE;
DROP TABLE IF EXISTS color_library CASCADE;

# This removes the Phase 2A tables so we can start fresh
```

### **Step 3: Deploy Phase 1 Foundation Migration**

**Option A: Via Supabase CLI (Recommended)**

```bash
# 1. Install Supabase CLI if not already installed
npm install -g supabase

# 2. Link your project
supabase link --project-ref your-project-ref

# 3. Create migrations folder in your project if it doesn't exist
mkdir -p supabase/migrations

# 4. Copy the Phase 1 migration file
# Save the 20241220000000_phase_1_foundation.sql file to:
# supabase/migrations/20241220000000_phase_1_foundation.sql

# 5. Deploy the migration
supabase db push
```

**Option B: Via Supabase Dashboard (Quick & Easy)**

```bash
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Click "New Query"
# 3. Copy and paste the ENTIRE contents of:
#    20241220000000_phase_1_foundation.sql
# 4. Click "Run" (bottom right)
# 5. Check for success messages - should see:
#    - Tables created
#    - Indexes created
#    - Policies created
```

### **Step 4: Verify Phase 1 Deployment**

```sql
-- Run this query in Supabase SQL Editor to verify tables exist:

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'projects', 'scope_items', 'vendors', 'project_rooms', 'project_transactions')
ORDER BY table_name;

-- You should see all 6 tables listed
```

### **Step 5: Re-Deploy Phase 2A (Design Intelligence)**

Now that foundation tables exist, Phase 2A can be deployed:

```bash
# Option A: Via Supabase CLI
supabase db push

# Option B: Via Dashboard
# 1. Go to SQL Editor
# 2. Find your existing Phase 2A migration or paste it
# 3. Run it
# 4. Should complete successfully now!
```

### **Step 6: Verify Complete Schema**

```sql
-- Check that ALL tables now exist:

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- You should see:
-- ✓ users
-- ✓ projects  
-- ✓ scope_items
-- ✓ vendors
-- ✓ project_rooms
-- ✓ project_transactions
-- ✓ color_library
-- ✓ color_palettes
-- ✓ project_color_selections
-- ✓ material_library
-- ✓ project_material_selections
-- ✓ moodboards
-- ✓ moodboard_elements
-- ✓ moodboard_shares
```

---

## 🔧 Setup Authentication

### **Enable Supabase Auth Providers**

1. **Go to Supabase Dashboard > Authentication > Providers**

2. **Enable Email Auth:**
   - Email: ✅ Enable
   - Confirm email: ✅ (or ❌ for development)
   - Email templates: Customize if desired

3. **Enable Google OAuth (Optional but recommended):**
   - Click "Google"
   - Get credentials from Google Cloud Console:
     - Go to console.cloud.google.com
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Paste Client ID & Secret into Supabase
   - Save

### **Configure Site URL & Redirect URLs**

```bash
# In Supabase Dashboard > Authentication > URL Configuration

Site URL: http://localhost:3000  (development)
          https://your-domain.com (production)

Redirect URLs:
  http://localhost:3000/**
  https://your-domain.com/**
```

---

## 🎨 Seed Initial Data (Optional)

### **Seed Sherwin Williams Colors**

```sql
-- Run this in SQL Editor to populate popular paint colors:

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, design_styles, popular) VALUES
('sherwin_williams', 'SW 7005', 'Pure White', '#F2F0EB', '{"r": 242, "g": 240, "b": 235}', 84, ARRAY['neutral'], 'white', ARRAY['modern_farmhouse', 'contemporary', 'transitional'], true),
('sherwin_williams', 'SW 7006', 'Extra White', '#F4F3F0', '{"r": 244, "g": 243, "b": 240}', 86, ARRAY['cool'], 'white', ARRAY['modern_farmhouse', 'contemporary'], true),
('sherwin_williams', 'SW 7008', 'Alabaster', '#EDEAE0', '{"r": 237, "g": 234, "b": 224}', 82, ARRAY['warm'], 'white', ARRAY['traditional', 'transitional'], true),
('sherwin_williams', 'SW 7015', 'Repose Gray', '#8C8B84', '{"r": 140, "g": 139, "b": 132}', 58, ARRAY['neutral', 'warm'], 'gray', ARRAY['modern_farmhouse', 'contemporary'], true),
('sherwin_williams', 'SW 7029', 'Agreeable Gray', '#9D9C93', '{"r": 157, "g": 156, "b": 147}', 60, ARRAY['warm'], 'beige', ARRAY['transitional', 'traditional'], true),
('sherwin_williams', 'SW 7069', 'Iron Ore', '#4E4F4F', '{"r": 78, "g": 79, "b": 79}', 6, ARRAY['neutral'], 'gray', ARRAY['modern_farmhouse', 'modern'], true),
('sherwin_williams', 'SW 7036', 'Accessible Beige', '#D6C9BE', '{"r": 214, "g": 201, "b": 190}', 58, ARRAY['warm'], 'beige', ARRAY['traditional', 'transitional'], true),
('sherwin_williams', 'SW 9178', 'On the Rocks', '#B5B3AC', '{"r": 181, "g": 179, "b": 172}', 52, ARRAY['neutral'], 'gray', ARRAY['contemporary'], true);
```

### **Seed Test User & Project (Development Only)**

```sql
-- Create a test user (link to your auth.users later)
INSERT INTO users (auth_id, email, full_name, company_name) VALUES
(auth.uid(), 'test@example.com', 'Test User', 'Test Rehab Co');

-- Create a test project
INSERT INTO projects (
  user_id, 
  project_name, 
  status,
  address_street,
  address_city,
  address_state,
  address_zip,
  property_type,
  square_footage,
  bedrooms,
  bathrooms,
  investment_strategy,
  purchase_price,
  arv,
  max_budget
) VALUES (
  (SELECT id FROM users WHERE email = 'test@example.com'),
  '123 Main St Flip',
  'planning',
  '123 Main Street',
  'Minneapolis',
  'MN',
  '55401',
  'single_family',
  1500,
  3,
  2.0,
  'flip',
  200000,
  350000,
  75000
);

-- Add some test scope items
INSERT INTO scope_items (
  project_id,
  category,
  subcategory,
  item_name,
  description,
  room_type,
  quantity,
  unit_type,
  quality_tier,
  total_cost,
  priority,
  estimated_duration_days
) VALUES 
(
  (SELECT id FROM projects WHERE project_name = '123 Main St Flip'),
  'interior',
  'kitchen',
  'Kitchen Cabinet Reface',
  'Paint existing cabinets white, new hardware',
  'kitchen',
  1,
  'each',
  'standard',
  4500,
  'must',
  3
),
(
  (SELECT id FROM projects WHERE project_name = '123 Main St Flip'),
  'interior',
  'kitchen',
  'Quartz Countertops',
  'Install quartz countertops with waterfall edge',
  'kitchen',
  45,
  'sq_ft',
  'premium',
  3600,
  'must',
  2
);
```

---

## 🚀 Next Steps: Build the App

### **1. Setup Supabase Client**

Create these files in your Next.js app:

**`src/lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`src/lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

**`.env.local`**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Get these from Supabase Dashboard > Project Settings > API
```

### **2. Build Login Page**

**`src/app/(auth)/login/page.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
```

### **3. Build Dashboard**

**`src/app/(dashboard)/page.tsx`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Your Projects</h1>
      
      {projects?.length === 0 ? (
        <div className="mt-8 text-center">
          <p>No projects yet!</p>
          <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
            Create First Project
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {projects?.map((project) => (
            <div key={project.id} className="rounded border p-4">
              <h2 className="text-xl font-semibold">{project.project_name}</h2>
              <p>{project.address_city}, {project.address_state}</p>
              <p>Status: {project.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## ✅ Verification Checklist

- [ ] Phase 1 migration deployed successfully
- [ ] Phase 2A migration deployed successfully  
- [ ] Auth providers configured (Email + Google)
- [ ] Test user can login
- [ ] Dashboard shows "No projects" or test projects
- [ ] Can create new project (basic form)

---

## 🆘 Troubleshooting

### **Error: "relation 'projects' does not exist"**
- Phase 1 migration didn't run
- Re-run the foundation migration

### **Error: "permission denied for table projects"**  
- RLS policies not applied
- Check that RLS is enabled and policies exist

### **Can't login / Auth not working**
- Check .env.local has correct Supabase credentials
- Verify auth providers are enabled in Supabase Dashboard
- Check redirect URLs are configured

### **TypeScript errors in components**
- Run `npm install` to ensure all deps installed
- Restart your dev server
- Check that @supabase/ssr is installed

---

## 📞 Need Help?

If you hit any issues:
1. Check Supabase logs (Dashboard > Logs)
2. Check browser console for errors
3. Verify environment variables are set
4. Ask for help with specific error messages

---

## 🎯 What's Next?

Once database is deployed and auth works:

1. **Build 7-Step Wizard:**
   - Property Details form
   - Condition Assessment
   - Strategy & Goals
   - Scope Builder
   - Priority Matrix
   - Timeline (React Flow)
   - Final Review

2. **Core Features:**
   - Project CRUD operations
   - Scope item management
   - Cost calculations
   - Vendor management

3. **Advanced Features (Phase 2+):**
   - Moodboard builder
   - Color/material selection
   - Portfolio showcase
   - Vendor packets
   - ROI analytics

Good luck! 🚀
