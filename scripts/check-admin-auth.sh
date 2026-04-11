#!/bin/bash
# Verify all admin API routes have authentication checks.
# Run: bash scripts/check-admin-auth.sh
# Exit 0 = all protected, Exit 1 = unprotected routes found

FAILED=0
for f in $(find src/app/api/admin -name "route.ts"); do
  if ! grep -q "requireAdmin\|getAuthUser\|verifyCronSecret\|CRON_SECRET\|getAdminUser" "$f"; then
    echo "ERROR: $f missing auth check"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "FAIL: Some admin API routes lack authentication."
  echo "Fix: Add 'import { requireAdmin } from \"@/lib/admin-auth\"' and call it at the top of each handler."
  exit 1
fi

echo "PASS: All admin API routes have auth checks."
exit 0
