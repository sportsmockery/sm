#!/bin/bash
# Safe Deploy Script for Multiple Claude Code Sessions
# Prevents concurrent deployments and syncs with remote before deploying

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE="origin"
LOCK_FILE="/tmp/sm-deploy.lock"
MAX_WAIT=300  # Max seconds to wait for another deployment
POLL_INTERVAL=10

# Cleanup function
cleanup() {
    if [ -f "$LOCK_FILE" ] && [ "$(cat $LOCK_FILE 2>/dev/null)" = "$$" ]; then
        rm -f "$LOCK_FILE"
    fi
}
trap cleanup EXIT

# Check for and wait on concurrent deployments
check_vercel_deploying() {
    # Check if there's a deployment currently building
    local status=$(vercel list --prod 2>/dev/null | grep "Building" | head -1)
    if [ -n "$status" ]; then
        return 0  # Deployment in progress
    fi
    return 1  # No deployment in progress
}

acquire_lock() {
    local waited=0

    while true; do
        # Check if lock file exists and is held by another process
        if [ -f "$LOCK_FILE" ]; then
            local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null)

            # Check if the process holding the lock is still running
            if [ -n "$lock_pid" ] && kill -0 "$lock_pid" 2>/dev/null; then
                if [ $waited -ge $MAX_WAIT ]; then
                    echo ""
                    echo "❌ DEPLOYMENT BLOCKED - Timeout waiting for other deployment"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "Another deployment (PID: $lock_pid) has been running for over 5 minutes."
                    echo "If it's stuck, remove the lock file manually:"
                    echo "  rm $LOCK_FILE"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    exit 1
                fi

                echo "⏳ Another deployment in progress (PID: $lock_pid). Waiting... (${waited}s/${MAX_WAIT}s)"
                sleep $POLL_INTERVAL
                waited=$((waited + POLL_INTERVAL))
                continue
            else
                # Stale lock file - remove it
                rm -f "$LOCK_FILE"
            fi
        fi

        # Also check Vercel for in-progress deployments
        if check_vercel_deploying; then
            if [ $waited -ge $MAX_WAIT ]; then
                echo ""
                echo "❌ DEPLOYMENT BLOCKED - Timeout waiting for Vercel deployment"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "A Vercel deployment is still building after 5 minutes."
                echo "Check Vercel dashboard: https://vercel.com/chris-burhans-projects/sm"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                exit 1
            fi

            echo "⏳ Vercel deployment in progress. Waiting... (${waited}s/${MAX_WAIT}s)"
            sleep $POLL_INTERVAL
            waited=$((waited + POLL_INTERVAL))
            continue
        fi

        # Try to acquire lock
        echo $$ > "$LOCK_FILE"

        # Verify we got the lock (race condition check)
        sleep 1
        if [ "$(cat $LOCK_FILE 2>/dev/null)" = "$$" ]; then
            return 0  # Lock acquired
        fi
    done
}

echo "🔒 Checking for concurrent deployments..."
acquire_lock
echo "✅ Lock acquired"
echo ""

echo "🔍 Syncing with $REMOTE/$BRANCH before deployment..."
echo ""

# Fetch latest from remote
git fetch $REMOTE $BRANCH --quiet

# Get commit info
LOCAL=$(git rev-parse HEAD)
REMOTE_HEAD=$(git rev-parse $REMOTE/$BRANCH)
BASE=$(git merge-base HEAD $REMOTE/$BRANCH)

# Check various states and handle automatically
if [ "$LOCAL" = "$REMOTE_HEAD" ]; then
    echo "✅ Already up to date with remote"

elif [ "$LOCAL" = "$BASE" ]; then
    # Local is behind remote - fast-forward pull
    BEHIND_COUNT=$(git rev-list --count HEAD..$REMOTE/$BRANCH)
    echo "📥 Pulling $BEHIND_COUNT commit(s) from other sessions..."
    git pull --rebase $REMOTE $BRANCH
    echo "✅ Synced with remote"

elif [ "$REMOTE_HEAD" = "$BASE" ]; then
    # Local is ahead of remote - just need to push
    AHEAD_COUNT=$(git rev-list --count $REMOTE/$BRANCH..HEAD)
    echo "✅ Local is $AHEAD_COUNT commit(s) ahead of remote"

else
    # Branches have diverged - attempt auto-rebase
    AHEAD_COUNT=$(git rev-list --count $REMOTE/$BRANCH..HEAD)
    BEHIND_COUNT=$(git rev-list --count HEAD..$REMOTE/$BRANCH)
    echo "⚠️  Branch diverged: $AHEAD_COUNT ahead, $BEHIND_COUNT behind"
    echo "📥 Attempting automatic rebase..."

    # Try to rebase - if conflicts occur, abort and give instructions
    if git rebase $REMOTE/$BRANCH; then
        echo "✅ Successfully rebased on top of remote changes"
    else
        echo ""
        echo "❌ DEPLOYMENT BLOCKED - Merge conflicts detected"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        git rebase --abort 2>/dev/null || true
        echo ""
        echo "Conflicting commits from other sessions:"
        git log --oneline HEAD..$REMOTE/$BRANCH | head -5
        echo ""
        echo "Your commits that need to be rebased:"
        git log --oneline $REMOTE/$BRANCH..HEAD | head -5
        echo ""
        echo "To fix manually:"
        echo "  git pull --rebase origin $BRANCH"
        echo "  # Resolve conflicts in each file"
        echo "  git add <resolved-files>"
        echo "  git rebase --continue"
        echo "  npm run deploy"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        exit 1
    fi
fi

# Check for uncommitted changes - fail if any exist
if ! git diff-index --quiet HEAD --; then
    echo ""
    echo "❌ DEPLOYMENT BLOCKED - Uncommitted changes detected"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    git status --short
    echo ""
    echo "Commit your changes first:"
    echo "  git add <files>"
    echo "  git commit -m \"Your message\""
    echo "  npm run deploy"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi

# Check for untracked files (excluding common ones)
UNTRACKED=$(git status --porcelain | grep "^??" | grep -v "node_modules" | grep -v ".env" | grep -v ".DS_Store" || true)
if [ -n "$UNTRACKED" ]; then
    echo ""
    echo "⚠️  Warning: Untracked files detected (not blocking deployment)"
    echo "$UNTRACKED"
    echo ""
fi

# Push to remote first to ensure our changes are saved
echo ""
echo "📤 Pushing to $REMOTE/$BRANCH..."
git push $REMOTE $BRANCH

# Now deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod --archive=tgz "$@"

echo ""
echo "✅ Deployment complete!"

# Lock is automatically released by trap on exit
