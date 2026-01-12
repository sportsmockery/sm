#!/bin/bash
# Progress watcher script - monitors MASTER-LOG.txt and updates progress.json

LOG_FILE="MASTER-LOG.txt"
JSON_FILE="public/progress.json"

# Create public directory if it doesn't exist
mkdir -p public

# Copy dashboard to public
cp progress-dashboard.html public/index.html 2>/dev/null

echo "📊 Progress watcher started"
echo "Dashboard: http://localhost:3002"
echo "Watching: $LOG_FILE"
echo ""

update_json() {
  if [ ! -f "$LOG_FILE" ]; then
    echo '{"total":0,"session1":0,"session2":0,"session3":0,"session4":0,"entries":[]}' > "$JSON_FILE"
    return
  fi
  
  # Count completions per session
  s1=$(grep -c "\[Session 1\].*done" "$LOG_FILE" 2>/dev/null || echo 0)
  s2=$(grep -c "\[Session 2\].*done" "$LOG_FILE" 2>/dev/null || echo 0)
  s3=$(grep -c "\[Session 3\].*done" "$LOG_FILE" 2>/dev/null || echo 0)
  s4=$(grep -c "\[Session 4\].*done" "$LOG_FILE" 2>/dev/null || echo 0)
  total=$((s1 + s2 + s3 + s4))
  
  # Get last 50 entries and format as JSON
  entries=$(tail -50 "$LOG_FILE" 2>/dev/null | while IFS='|' read -r session timestamp task status file; do
    session_num=$(echo "$session" | grep -o '[0-9]')
    time=$(echo "$timestamp" | xargs | cut -d' ' -f2)
    task=$(echo "$task" | xargs)
    status=$(echo "$status" | xargs)
    file=$(echo "$file" | xargs)
    echo "{\"session\":\"$session_num\",\"time\":\"$time\",\"task\":\"$task\",\"status\":\"$status\",\"file\":\"$file\"}"
  done | paste -sd ',' -)
  
  # Write JSON
  echo "{\"total\":$total,\"session1\":$s1,\"session2\":$s2,\"session3\":$s3,\"session4\":$s4,\"entries\":[$entries]}" > "$JSON_FILE"
}

# Initial update
update_json

# Start simple HTTP server in background
cd public
python3 -m http.server 3002 &
SERVER_PID=$!
cd ..

echo "Server started (PID: $SERVER_PID)"
echo ""

# Watch for changes
while true; do
  update_json
  sleep 2
done
