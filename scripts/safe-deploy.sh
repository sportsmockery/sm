#!/bin/bash
# Safe Deploy Script for Multiple Claude Code Sessions
# Automatically syncs with remote before deploying to prevent overwrites

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE="origin"

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
