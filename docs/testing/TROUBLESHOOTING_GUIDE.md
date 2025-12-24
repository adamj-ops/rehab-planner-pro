# Phase 2A Troubleshooting Guide

> **Purpose:** Save debugging time with documented solutions to common issues. When something breaks, check here first.

---

## Table of Contents

1. [Quick Diagnosis](#quick-diagnosis)
2. [Supabase & Database Issues](#supabase--database-issues)
3. [Component Rendering Issues](#component-rendering-issues)
4. [State Management Issues](#state-management-issues)
5. [Image & File Upload Issues](#image--file-upload-issues)
6. [Moodboard Canvas Issues](#moodboard-canvas-issues)
7. [PDF Export Issues](#pdf-export-issues)
8. [API & Network Issues](#api--network-issues)
9. [Build & Deployment Issues](#build--deployment-issues)
10. [Performance Issues](#performance-issues)

---

## Quick Diagnosis

### Error Message Lookup

| Error Message | Likely Cause | Jump To |
|--------------|--------------|---------|
| "Supabase client not defined" | Missing env vars | [Supabase Setup](#supabase-client-not-defined) |
| "relation does not exist" | Table not created | [Missing Table](#relation-table-does-not-exist) |
| "RLS policy violation" | Permission denied | [RLS Policy Error](#permission-denied-rls-policy-error) |
| "Hydration mismatch" | Server/client difference | [Hydration Error](#hydration-mismatch-error) |
| "Cannot read property of undefined" | Data not loaded | [Undefined Data](#cannot-read-property-of-undefined) |
| "Maximum update depth exceeded" | Infinite loop | [Infinite Loop](#maximum-update-depth-exceeded) |
| "Failed to fetch" | Network/CORS issue | [Fetch Failed](#failed-to-fetch) |
| "Invalid hook call" | Hook rules violated | [Invalid Hook](#invalid-hook-call) |

### First Steps for Any Issue

```bash
# 1. Check for TypeScript errors
npm run build

# 2. Check console for errors
# Open browser DevTools → Console tab

# 3. Check network requests
# Open browser DevTools → Network tab

# 4. Verify environment variables
cat .env.local

# 5. Clear caches and restart
rm -rf .next node_modules/.cache
npm run dev
```

---

## Supabase & Database Issues

### Supabase client not defined

**Symptom:**
```
Error: Supabase client not defined
```

**Cause:** Missing or incorrect environment variables.

**Solution:**

1. Check `.env.local` exists and has correct values:
```bash
cat .env.local
```

2. Should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

3. Verify import is correct:
```typescript
// ✅ Correct
import { createClient } from '@/lib/supabase/client'

// ❌ Wrong
import { createClient } from '@supabase/supabase-js'
```

4. Restart dev server after changing env vars:
```bash
npm run dev
```

---

### Relation (table) does not exist

**Symptom:**
```
Error: relation "color_library" does not exist
```

**Cause:** Database migration not run.

**Solution:**

1. Check migration status:
```bash
npx supabase migration list
```

2. Apply pending migrations:
```bash
npx supabase db push
# OR for local dev:
npx supabase db reset
```

3. Verify table exists:
```sql
-- In Supabase SQL Editor
SELECT * FROM color_library LIMIT 1;
```

4. If migration is missing, create it:
```bash
npx supabase migration new add_color_library
# Edit the new migration file
npx supabase db push
```

---

### Permission denied (RLS policy error)

**Symptom:**
```
Error: new row violates row-level security policy
```

**Cause:** RLS enabled but no policy allows the operation.

**Solution:**

1. Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

2. Check existing policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'color_library';
```

3. Add missing policy:
```sql
-- For public read access
CREATE POLICY "Allow public read" ON color_library
  FOR SELECT USING (true);

-- For authenticated user write
CREATE POLICY "Allow user write" ON project_color_selections
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );
```

4. Temporarily disable RLS for debugging:
```sql
ALTER TABLE color_library DISABLE ROW LEVEL SECURITY;
-- TEST YOUR QUERY
ALTER TABLE color_library ENABLE ROW LEVEL SECURITY;
```

---

### No data returned but no error

**Symptom:** Query returns empty array, no error message.

**Cause:** Data doesn't exist or RLS filtering it out.

**Solution:**

1. Check if data exists (bypass RLS):
```sql
-- In Supabase SQL Editor (bypasses RLS)
SELECT COUNT(*) FROM color_library;
```

2. Check RLS policies allow read:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'color_library' 
AND cmd = 'SELECT';
```

3. Check user context:
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user?.id)
```

4. Verify join columns exist:
```sql
-- If using foreign key
SELECT id FROM projects WHERE user_id = '[your-user-id]';
```

---

## Component Rendering Issues

### Hydration mismatch error

**Symptom:**
```
Warning: Text content did not match. Server: "..." Client: "..."
Error: Hydration failed because the initial UI does not match
```

**Cause:** Server and client render different content.

**Common causes:**
- Using `Date.now()` or random values
- Using browser-only APIs (`window`, `localStorage`)
- Conditional rendering based on client state

**Solution:**

1. Use `useEffect` for client-only code:
```typescript
// ❌ Wrong - runs on server
const [mounted, setMounted] = useState(typeof window !== 'undefined')

// ✅ Correct
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

2. Use dynamic import with `ssr: false`:
```typescript
import dynamic from 'next/dynamic'

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
)
```

3. For dates/times:
```typescript
// ❌ Wrong
<span>{new Date().toLocaleString()}</span>

// ✅ Correct
const [date, setDate] = useState<string>('')
useEffect(() => {
  setDate(new Date().toLocaleString())
}, [])
<span>{date}</span>
```

---

### Cannot read property of undefined

**Symptom:**
```
TypeError: Cannot read property 'colorName' of undefined
```

**Cause:** Accessing property before data loads.

**Solution:**

1. Add null check:
```typescript
// ❌ Wrong
<span>{color.colorName}</span>

// ✅ Correct - optional chaining
<span>{color?.colorName}</span>

// ✅ Correct - early return
if (!color) return <Skeleton />
<span>{color.colorName}</span>
```

2. Check loading state:
```typescript
const { colors, loading } = useDesignStore()

if (loading) return <Spinner />
if (!colors.length) return <Empty />

return <ColorGrid colors={colors} />
```

3. Provide default values:
```typescript
const colorName = color?.colorName ?? 'Unknown Color'
```

---

### Maximum update depth exceeded

**Symptom:**
```
Error: Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

**Cause:** Infinite render loop, usually from:
- `useEffect` without proper dependencies
- State update in render body
- Function recreation causing effect re-run

**Solution:**

1. Check useEffect dependencies:
```typescript
// ❌ Wrong - object/array as dependency
useEffect(() => {
  fetchColors(filters)
}, [filters]) // filters is new object each render

// ✅ Correct - primitive dependencies
useEffect(() => {
  fetchColors({ family: selectedFamily })
}, [selectedFamily])
```

2. Memoize callbacks:
```typescript
// ❌ Wrong - new function each render
<ColorGrid onSelect={(c) => handleSelect(c)} />

// ✅ Correct - stable function
const handleColorSelect = useCallback((color) => {
  setSelectedColor(color)
}, [])
<ColorGrid onSelect={handleColorSelect} />
```

3. Don't call setState in render:
```typescript
// ❌ Wrong
function Component() {
  const [count, setCount] = useState(0)
  setCount(count + 1) // Infinite loop!
  return <div>{count}</div>
}

// ✅ Correct
function Component() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(c => c + 1)
  }, []) // Only once on mount
  return <div>{count}</div>
}
```

---

## State Management Issues

### Store not updating UI

**Symptom:** Store action fires but component doesn't re-render.

**Cause:** Not subscribed to correct state slice.

**Solution:**

1. Check you're selecting correct state:
```typescript
// ❌ Wrong - selecting entire state
const state = useDesignStore()
return <div>{state.colorLibrary.length}</div>

// ✅ Correct - selecting specific slice
const colorCount = useDesignStore(s => s.colorLibrary.length)
return <div>{colorCount}</div>
```

2. Check action is actually updating state:
```typescript
// Add console log in action
addColorSelection: (selection) => {
  console.log('Adding selection:', selection)
  set((state) => ({
    projectColorSelections: [...state.projectColorSelections, selection],
  }))
}
```

3. Verify with DevTools:
```javascript
// In browser console
window.__ZUSTAND_DEVTOOLS__?.stores?.DesignStore?.getState()
```

---

### Store state resets on refresh

**Symptom:** State lost when page refreshes.

**Cause:** Not using persist middleware correctly.

**Solution:**

1. Verify persist middleware setup:
```typescript
import { persist } from 'zustand/middleware'

export const useDesignStore = create(
  persist(
    (set, get) => ({ /* state */ }),
    { 
      name: 'design-store',
      partialize: (state) => ({
        // Only persist what you need
        colorViewMode: state.colorViewMode,
      }),
    }
  )
)
```

2. Check localStorage:
```javascript
// In browser console
localStorage.getItem('design-store')
```

3. For data that should persist, use API calls instead:
```typescript
// Don't persist data, fetch on load
useEffect(() => {
  const loadColors = async () => {
    const response = await fetch('/api/colors')
    const data = await response.json()
    setColorLibrary(data)
  }
  loadColors()
}, [])
```

---

## Image & File Upload Issues

### Image upload fails silently

**Symptom:** Upload appears to work but image doesn't display.

**Cause:** Storage bucket not configured or CORS issue.

**Solution:**

1. Check bucket exists:
```sql
-- In Supabase SQL Editor
SELECT * FROM storage.buckets;
```

2. Create bucket if missing:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('moodboard-images', 'moodboard-images', true);
```

3. Add storage policy:
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'moodboard-images');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'moodboard-images');
```

4. Check CORS settings in Supabase Dashboard:
   - Storage → Settings → CORS
   - Add your domain to allowed origins

---

### Image displays as broken

**Symptom:** Image element shows broken icon.

**Cause:** URL incorrect or image deleted.

**Solution:**

1. Check URL is valid:
```javascript
console.log('Image URL:', imageUrl)
// Open URL in new tab to verify
```

2. Check if using public URL:
```typescript
// ✅ Correct - get public URL
const { data } = supabase.storage
  .from('moodboard-images')
  .getPublicUrl(filePath)

console.log('Public URL:', data.publicUrl)
```

3. Check Next.js image config if using next/image:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-project.supabase.co'],
  },
}
```

---

## Moodboard Canvas Issues

### Elements not draggable

**Symptom:** Canvas elements render but can't be moved.

**Cause:** DnD context not set up or sensors missing.

**Solution:**

1. Verify DndContext wrapper:
```typescript
import { DndContext } from '@dnd-kit/core'

return (
  <DndContext
    sensors={sensors}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
  >
    {/* Canvas content */}
  </DndContext>
)
```

2. Check sensors configured:
```typescript
const sensors = useSensors(
  useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5, // Start drag after 5px
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
)
```

3. Verify element has draggable props:
```typescript
import { useDraggable } from '@dnd-kit/core'

function DraggableElement({ id }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform 
          ? `translate(${transform.x}px, ${transform.y}px)` 
          : undefined,
      }}
    >
      Content
    </div>
  )
}
```

---

### Canvas zoom not working

**Symptom:** Zoom controls don't change canvas size.

**Cause:** Transform not applied or state not updating.

**Solution:**

1. Apply zoom transform to canvas container:
```typescript
<div
  style={{
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  }}
>
  {/* Canvas elements */}
</div>
```

2. Include zoom wrapper for proper sizing:
```typescript
<div className="overflow-auto border">
  <div
    style={{
      width: canvasWidth * zoom,
      height: canvasHeight * zoom,
    }}
  >
    <div style={{ transform: `scale(${zoom})` }}>
      {/* Elements */}
    </div>
  </div>
</div>
```

---

## PDF Export Issues

### PDF export blank or corrupted

**Symptom:** Downloaded PDF is empty or won't open.

**Cause:** html2canvas failing or jsPDF misconfigured.

**Solution:**

1. Add useCORS for external images:
```typescript
const canvas = await html2canvas(element, {
  scale: 2,
  useCORS: true, // Required for external images
  allowTaint: false,
  backgroundColor: '#ffffff',
})
```

2. Wait for images to load:
```typescript
// Wait for all images
await Promise.all(
  Array.from(element.querySelectorAll('img')).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise(resolve => {
      img.onload = resolve
      img.onerror = resolve
    })
  })
)

// Then capture
const canvas = await html2canvas(element)
```

3. Check PDF dimensions:
```typescript
const pdf = new jsPDF({
  orientation: 'portrait',
  unit: 'in',
  format: 'letter', // 8.5 x 11 inches
})

// Image must fit
const imgWidth = 8.5
const imgHeight = (canvas.height * imgWidth) / canvas.width
pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
```

---

## API & Network Issues

### Failed to fetch

**Symptom:**
```
TypeError: Failed to fetch
```

**Cause:** Network error, CORS, or server not running.

**Solution:**

1. Check server is running:
```bash
# Is dev server running?
curl http://localhost:3000/api/colors
```

2. Check CORS headers in API route:
```typescript
export async function GET(request: Request) {
  // Add CORS headers if needed
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}
```

3. Check URL is correct:
```typescript
// ❌ Wrong - relative path in wrong context
fetch('/api/colors')

// ✅ Correct - use full URL when needed
fetch(`${process.env.NEXT_PUBLIC_URL}/api/colors`)
```

---

### 401 Unauthorized

**Symptom:** API returns 401 error.

**Cause:** Not authenticated or session expired.

**Solution:**

1. Check user is logged in:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect to login
}
```

2. Refresh session:
```typescript
const { data, error } = await supabase.auth.refreshSession()
```

3. Check cookies are sent:
```typescript
// In API route
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log('API user:', user)
```

---

## Build & Deployment Issues

### Build fails with type errors

**Symptom:**
```
Type error: Property 'x' does not exist on type 'y'
```

**Solution:**

1. Run type check:
```bash
npx tsc --noEmit
```

2. Check for implicit any:
```typescript
// ❌ Missing type
function handle(data) { ... }

// ✅ Add type
function handle(data: ColorLibraryItem) { ... }
```

3. Regenerate types from database:
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

---

### Module not found

**Symptom:**
```
Module not found: Can't resolve '@/lib/something'
```

**Solution:**

1. Check path alias in tsconfig.json:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. Check file actually exists:
```bash
ls src/lib/something.ts
```

3. Check import case matches file:
```bash
# Files are case-sensitive on Linux
ls src/lib/ | grep -i something
```

---

## Performance Issues

### Slow initial load

**Symptom:** Page takes > 5 seconds to load.

**Solution:**

1. Check bundle size:
```bash
npm run build
# Look for large chunks in output
```

2. Lazy load heavy components:
```typescript
import dynamic from 'next/dynamic'

const MoodboardCanvas = dynamic(
  () => import('@/components/design/moodboard-canvas'),
  { 
    loading: () => <Skeleton />,
    ssr: false,
  }
)
```

3. Optimize images:
```typescript
import Image from 'next/image'

<Image
  src={imageUrl}
  width={200}
  height={200}
  loading="lazy"
/>
```

---

### UI feels laggy during drag

**Symptom:** Dragging elements stutters.

**Solution:**

1. Use CSS transform instead of top/left:
```typescript
// ❌ Slow - causes layout recalculation
style={{ left: x, top: y }}

// ✅ Fast - GPU accelerated
style={{ transform: `translate(${x}px, ${y}px)` }}
```

2. Debounce position updates:
```typescript
const debouncedUpdate = useMemo(
  () => debounce((id, x, y) => updateElement(id, { x, y }), 16),
  []
)
```

3. Use will-change hint:
```css
.draggable {
  will-change: transform;
}
```

---

## Still Stuck?

### Collect Debug Info

Before asking for help, gather:

1. **Error message** - Full text from console
2. **Stack trace** - Expanded error details
3. **Environment** - OS, Node version, browser
4. **Steps to reproduce** - What you did before error
5. **Recent changes** - What changed since it worked

### Debug Commands

```bash
# Full system info
npx envinfo --system --binaries --npmPackages

# Check Node version
node -v

# Check npm packages
npm ls

# Clear all caches
rm -rf .next node_modules/.cache
npm cache clean --force

# Fresh install
rm -rf node_modules
npm install
```

---

## Related Documentation

- [Testing Strategy](./TESTING_STRATEGY.md) - Run tests to verify fixes
- [Quality Checklist](./QUALITY_CHECKLIST.md) - Verify before marking fixed
- [Integration Sequences](../implementation/INTEGRATION_SEQUENCES.md) - Correct setup order

