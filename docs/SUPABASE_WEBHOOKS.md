# Supabase Webhooks for Cache Invalidation

This guide explains how to set up Supabase Database Webhooks to automatically invalidate the Next.js cache when data changes.

## Overview

The application uses Next.js `unstable_cache` for server-side caching of expensive database queries. When data changes in Supabase, we need to invalidate the cache so users see fresh data.

**Flow:**
```
User updates data in Supabase → 
Supabase triggers webhook → 
POST to /api/revalidate → 
Cache tags invalidated → 
Next request fetches fresh data
```

## Prerequisites

1. **Environment Variable**: Add `REVALIDATION_SECRET` to your Vercel/deployment environment:
   ```
   REVALIDATION_SECRET=your-secure-random-string-here
   ```
   Generate a secure secret: `openssl rand -base64 32`

2. **Deployed Application**: Your app must be deployed to a publicly accessible URL for Supabase to reach the webhook endpoint.

## Setting Up Webhooks in Supabase

### Step 1: Navigate to Database Webhooks

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Webhooks**
3. Click **Create a new webhook**

### Step 2: Configure Each Webhook

Create a webhook for each table you want to track:

#### Vendors Table
| Setting | Value |
|---------|-------|
| Name | `invalidate-vendors-cache` |
| Table | `vendors` |
| Events | `INSERT`, `UPDATE`, `DELETE` |
| Type | HTTP Request |
| Method | `POST` |
| URL | `https://your-domain.com/api/revalidate` |

**HTTP Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**HTTP Body:**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "vendors"
}
```

> **Note**: If your users have personalized vendor lists, consider also passing `userId` from the webhook payload to invalidate user-specific caches.

#### Materials Table
| Setting | Value |
|---------|-------|
| Name | `invalidate-materials-cache` |
| Table | `material_library` |
| Events | `INSERT`, `UPDATE`, `DELETE` |
| URL | `https://your-domain.com/api/revalidate` |

**HTTP Body:**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "material_library"
}
```

#### Colors Table
| Setting | Value |
|---------|-------|
| Name | `invalidate-colors-cache` |
| Table | `color_library` |
| Events | `INSERT`, `UPDATE`, `DELETE` |
| URL | `https://your-domain.com/api/revalidate` |

**HTTP Body:**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "color_library"
}
```

#### Scope Catalog Table
| Setting | Value |
|---------|-------|
| Name | `invalidate-scope-catalog-cache` |
| Table | `scope_catalog` |
| Events | `INSERT`, `UPDATE`, `DELETE` |
| URL | `https://your-domain.com/api/revalidate` |

**HTTP Body:**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "scope_catalog"
}
```

#### Labor Rates Table
| Setting | Value |
|---------|-------|
| Name | `invalidate-labor-rates-cache` |
| Table | `labor_rates` |
| Events | `INSERT`, `UPDATE`, `DELETE` |
| URL | `https://your-domain.com/api/revalidate` |

**HTTP Body:**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "labor_rates"
}
```

#### Material Prices Table
| Setting | Value |
|---------|-------|
| Name | `invalidate-material-prices-cache` |
| Table | `material_prices` |
| Events | `INSERT`, `UPDATE`, `DELETE` |
| URL | `https://your-domain.com/api/revalidate` |

**HTTP Body:**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "material_prices"
}
```

#### Rehab Projects Table (for project stats)
| Setting | Value |
|---------|-------|
| Name | `invalidate-project-stats-cache` |
| Table | `rehab_projects` |
| Events | `UPDATE` |
| URL | `https://your-domain.com/api/revalidate` |

**HTTP Body (with project ID):**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "rehab_projects",
  "projectId": "{{record.id}}"
}
```

## Advanced: Using Supabase Row Data

Supabase webhooks can include the changed record data in the payload. You can use this for more granular cache invalidation:

### Example: User-Specific Vendor Cache

For the vendors table, you might want to invalidate only the specific user's cache:

**HTTP Body:**
```json
{
  "secret": "{{env.REVALIDATION_SECRET}}",
  "table": "vendors",
  "userId": "{{record.user_id}}"
}
```

This will invalidate only that user's vendor cache (`user-vendors-{userId}`) instead of all vendor caches.

## Testing Webhooks

### 1. Check Endpoint Health

```bash
curl https://your-domain.com/api/revalidate
```

Response:
```json
{
  "status": "ok",
  "validTags": ["materials", "colors", "vendors", ...],
  "supportedTables": ["vendors", "material_library", ...],
  "message": "POST to this endpoint with { tag, path, projectId, userId, or table } to revalidate cache"
}
```

### 2. Test Manual Revalidation

```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret", "tag": "vendors"}'
```

Response:
```json
{
  "success": true,
  "revalidated": ["tag:vendors"],
  "timestamp": "2024-12-29T..."
}
```

### 3. Check Supabase Webhook Logs

In Supabase Dashboard:
1. Go to **Database** → **Webhooks**
2. Click on your webhook
3. View the **Logs** tab to see execution history and any errors

## Troubleshooting

### Webhook Not Firing

1. Verify the table and events are correctly configured
2. Check that the webhook is enabled
3. Ensure the URL is correct and publicly accessible

### 401 Unauthorized

- The `secret` in the webhook body doesn't match `REVALIDATION_SECRET`
- Environment variable not set in deployment

### 400 Bad Request

- Invalid tag specified
- Missing required fields in request body

### Cache Not Invalidating

1. Verify the webhook is firing (check Supabase logs)
2. Check Next.js logs for errors in the `/api/revalidate` handler
3. Ensure the cache tags match between the cached function and revalidation request

## Cache Tag Reference

| Table | Cache Tags |
|-------|------------|
| `vendors` | `vendors`, `user-vendors-{userId}` |
| `material_library` | `materials` |
| `color_library` | `colors` |
| `scope_catalog` | `scope-catalog` |
| `labor_rates` | `labor-rates` |
| `material_prices` | `material-prices` |
| `rehab_projects` | `project-stats`, `project-{projectId}` |

## Security Best Practices

1. **Use a strong secret**: Generate with `openssl rand -base64 32`
2. **Keep the secret in environment variables**: Never commit it to code
3. **Use HTTPS**: Always use HTTPS URLs for webhook endpoints
4. **Monitor webhook logs**: Check for unauthorized access attempts
5. **Rotate secrets periodically**: Update the secret every few months

## Alternative: Edge Function for Complex Logic

For complex invalidation logic (e.g., invalidating related caches), you can use a Supabase Edge Function as a middleware:

```typescript
// supabase/functions/cache-invalidation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const payload = await req.json()
  const { type, table, record, old_record } = payload

  // Determine which caches to invalidate based on the change
  const tagsToInvalidate: string[] = []

  if (table === 'vendors') {
    tagsToInvalidate.push('vendors')
    if (record?.user_id) {
      tagsToInvalidate.push(`user-vendors-${record.user_id}`)
    }
  }

  // Call the revalidation endpoint for each tag
  for (const tag of tagsToInvalidate) {
    await fetch('https://your-domain.com/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: Deno.env.get('REVALIDATION_SECRET'),
        tag,
      }),
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Then point your Supabase webhooks to this Edge Function instead of directly to the Next.js endpoint.
