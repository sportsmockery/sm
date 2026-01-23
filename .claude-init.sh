#!/bin/bash
# Source this file to enable deploy safety checks
# This adds the project's bin directory to PATH, making the vercel wrapper active

export PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/bin:$PATH"
echo "✅ Deploy safety checks enabled. Use 'vercel --prod' or 'npm run deploy' safely."
