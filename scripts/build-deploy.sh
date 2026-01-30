#!/bin/bash
# Build-Deploy Script for SportsMockery
# THE ONLY AUTHORIZED DEPLOY COMMAND: npm run build-deploy
#
# Safety features:
# 1. Checks current Vercel deployment status (waits if building)
# 2. Checks previous deployment — won't overwrite a successful build with a broken one
# 3. Checks for failed deployments and warns
# 4. Never removes data from past deployments
# 5. Syncs git before deploying
# 6. Uses lock file to prevent concurrent local deploys

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE="origin"
LOCK_FILE="/tmp/sm-build-deploy.lock"
MAX_WAIT=600  # Max seconds to wait for in-progress deployment
POLL_INTERVAL=15

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_err() { echo -e "${RED}[ERROR]${NC} $1"; }

# Cleanup function
cleanup() {
    if [ -f "$LOCK_FILE" ] && [ "$(cat $LOCK_FILE 2>/dev/null)" = "$$" ]; then
        rm -f "$LOCK_FILE"
    fi
}
trap cleanup EXIT

# ─────────────────────────────────────────────
# STEP 1: Acquire local lock
# ─────────────────────────────────────────────
acquire_lock() {
    local waited=0
    while true; do
        if [ -f "$LOCK_FILE" ]; then
            local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null)
            if [ -n "$lock_pid" ] && kill -0 "$lock_pid" 2>/dev/null; then
                if [ $waited -ge $MAX_WAIT ]; then
                    log_err "Timeout waiting for local lock (PID: $lock_pid)"
                    echo "  Remove manually: rm $LOCK_FILE"
                    exit 1
                fi
                log_info "Another local deploy in progress (PID: $lock_pid). Waiting... (${waited}s/${MAX_WAIT}s)"
                sleep $POLL_INTERVAL
                waited=$((waited + POLL_INTERVAL))
                continue
            else
                rm -f "$LOCK_FILE"
            fi
        fi
        echo $$ > "$LOCK_FILE"
        sleep 1
        if [ "$(cat $LOCK_FILE 2>/dev/null)" = "$$" ]; then
            return 0
        fi
    done
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SportsMockery Build-Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "Acquiring local deploy lock..."
acquire_lock
log_ok "Lock acquired"
echo ""

# ─────────────────────────────────────────────
# STEP 2: Check Vercel deployment status
# ─────────────────────────────────────────────
log_info "Checking Vercel deployment status..."

# Get recent deployments
DEPLOYMENTS=$(vercel list --prod 2>/dev/null || echo "")

if [ -n "$DEPLOYMENTS" ]; then
    # Check for currently building deployment
    BUILDING=$(echo "$DEPLOYMENTS" | grep -i "Building\|Queued\|Initializing" | head -1 || true)
    if [ -n "$BUILDING" ]; then
        log_warn "Existing deployment is currently building:"
        echo "  $BUILDING"
        echo ""

        waited=0
        while true; do
            STILL_BUILDING=$(vercel list --prod 2>/dev/null | grep -i "Building\|Queued\|Initializing" | head -1 || true)
            if [ -z "$STILL_BUILDING" ]; then
                log_ok "Previous deployment finished"
                break
            fi
            if [ $waited -ge $MAX_WAIT ]; then
                log_err "Timeout: existing deployment still building after ${MAX_WAIT}s"
                echo "  Check Vercel dashboard: https://vercel.com"
                exit 1
            fi
            log_info "Waiting for existing deployment to finish... (${waited}s/${MAX_WAIT}s)"
            sleep $POLL_INTERVAL
            waited=$((waited + POLL_INTERVAL))
        done
        echo ""
    fi

    # Check most recent deployment status
    LATEST=$(echo "$DEPLOYMENTS" | grep -E "Ready|Error" | head -1 || true)
    if echo "$LATEST" | grep -qi "Error"; then
        log_warn "Most recent deployment FAILED:"
        echo "  $LATEST"
        echo ""
        log_info "Proceeding — new deployment will not remove the last successful build"
    elif echo "$LATEST" | grep -qi "Ready"; then
        log_ok "Most recent deployment is healthy (Ready)"
    fi
else
    log_warn "Could not fetch Vercel deployment list (continuing anyway)"
fi
echo ""

# ─────────────────────────────────────────────
# STEP 3: Check for uncommitted changes
# ─────────────────────────────────────────────
log_info "Checking working tree..."

if ! git diff-index --quiet HEAD --; then
    log_err "Uncommitted changes detected — commit first!"
    git status --short
    echo ""
    echo "  git add <files>"
    echo "  git commit -m \"Your message\""
    echo "  npm run build-deploy"
    exit 1
fi
log_ok "Working tree clean"

# Warn about untracked files
UNTRACKED=$(git status --porcelain | grep "^??" | grep -v "node_modules" | grep -v ".env" | grep -v ".DS_Store" || true)
if [ -n "$UNTRACKED" ]; then
    log_warn "Untracked files (not blocking):"
    echo "$UNTRACKED"
fi
echo ""

# ─────────────────────────────────────────────
# STEP 4: Git sync with remote
# ─────────────────────────────────────────────
log_info "Syncing with $REMOTE/$BRANCH..."

git fetch $REMOTE $BRANCH --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse $REMOTE/$BRANCH)
BASE=$(git merge-base HEAD $REMOTE/$BRANCH)

if [ "$LOCAL" = "$REMOTE_HEAD" ]; then
    log_ok "Already up to date with remote"

elif [ "$LOCAL" = "$BASE" ]; then
    BEHIND_COUNT=$(git rev-list --count HEAD..$REMOTE/$BRANCH)
    log_info "Pulling $BEHIND_COUNT commit(s) from other sessions..."
    git pull --rebase $REMOTE $BRANCH
    log_ok "Synced with remote"

elif [ "$REMOTE_HEAD" = "$BASE" ]; then
    AHEAD_COUNT=$(git rev-list --count $REMOTE/$BRANCH..HEAD)
    log_ok "Local is $AHEAD_COUNT commit(s) ahead of remote"

else
    AHEAD_COUNT=$(git rev-list --count $REMOTE/$BRANCH..HEAD)
    BEHIND_COUNT=$(git rev-list --count HEAD..$REMOTE/$BRANCH)
    log_warn "Branch diverged: $AHEAD_COUNT ahead, $BEHIND_COUNT behind"
    log_info "Attempting automatic rebase..."

    if git rebase $REMOTE/$BRANCH; then
        log_ok "Successfully rebased"
    else
        git rebase --abort 2>/dev/null || true
        log_err "Merge conflicts detected — resolve manually:"
        echo "  git pull --rebase origin $BRANCH"
        echo "  # Resolve conflicts"
        echo "  git add <resolved-files>"
        echo "  git rebase --continue"
        echo "  npm run build-deploy"
        exit 1
    fi
fi
echo ""

# ─────────────────────────────────────────────
# STEP 5: Push to remote
# ─────────────────────────────────────────────
log_info "Pushing to $REMOTE/$BRANCH..."
git push $REMOTE $BRANCH
log_ok "Pushed to remote"
echo ""

# ─────────────────────────────────────────────
# STEP 6: Deploy to Vercel
# ─────────────────────────────────────────────
log_info "Deploying to Vercel (production)..."
echo ""
vercel --prod --yes --archive=tgz "$@"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_ok "Build-deploy complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
