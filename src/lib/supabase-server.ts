import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

**File structure should be:**
```
src/
├── app/
├── lib/
│   ├── supabase.ts        ← client-side
│   └── supabase-server.ts ← server-side (admin)