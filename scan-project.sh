#!/bin/bash
# Project Status Scanner v3 - Reads SESSION task files for accurate status
# Shows completion based on [x] markers in task files

PROJECT_DIR="${1:-$(pwd)}"
OUTPUT_FILE="PROJECT-STATUS.html"

echo "🔍 Scanning project: $PROJECT_DIR"
echo ""

# Count completed tasks from session files
count_completed() {
  local file="$1"
  if [ -f "$file" ]; then
    grep -c "\[x\]" "$file" 2>/dev/null || echo 0
  else
    echo 0
  fi
}

count_total() {
  local file="$1"
  if [ -f "$file" ]; then
    grep -c "\- \[ \]\|\- \[x\]" "$file" 2>/dev/null || echo 0
  else
    echo 0
  fi
}

# Get counts from each session file
S1_FILE="$PROJECT_DIR/SESSION-1-TASKS.md"
S2_FILE="$PROJECT_DIR/SESSION-2-TASKS.md"
S3_FILE="$PROJECT_DIR/SESSION-3-TASKS.md"
S4_FILE="$PROJECT_DIR/SESSION-4-TASKS.md"

s1_done=$(count_completed "$S1_FILE")
s1_total=$(count_total "$S1_FILE")
s2_done=$(count_completed "$S2_FILE")
s2_total=$(count_total "$S2_FILE")
s3_done=$(count_completed "$S3_FILE")
s3_total=$(count_total "$S3_FILE")
s4_done=$(count_completed "$S4_FILE")
s4_total=$(count_total "$S4_FILE")

total_done=$((s1_done + s2_done + s3_done + s4_done))
total_tasks=$((s1_total + s2_total + s3_total + s4_total))

if [ "$total_tasks" -gt 0 ]; then
  percent=$((total_done * 100 / total_tasks))
else
  percent=0
fi

# Calculate percentages per session
s1_pct=0; [ "$s1_total" -gt 0 ] && s1_pct=$((s1_done * 100 / s1_total))
s2_pct=0; [ "$s2_total" -gt 0 ] && s2_pct=$((s2_done * 100 / s2_total))
s3_pct=0; [ "$s3_total" -gt 0 ] && s3_pct=$((s3_done * 100 / s3_total))
s4_pct=0; [ "$s4_total" -gt 0 ] && s4_pct=$((s4_done * 100 / s4_total))

# Count actual files
total_files=$(find "$PROJECT_DIR/src" -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | xargs)
pages=$(find "$PROJECT_DIR/src/app" -name "page.tsx" 2>/dev/null | wc -l | xargs)
components=$(find "$PROJECT_DIR/src/components" -name "*.tsx" 2>/dev/null | wc -l | xargs)
hooks=$(find "$PROJECT_DIR/src/hooks" -name "*.ts" 2>/dev/null | wc -l | xargs)
libs=$(find "$PROJECT_DIR/src/lib" -name "*.ts" 2>/dev/null | wc -l | xargs)
api_routes=$(find "$PROJECT_DIR/src/app/api" -name "route.ts" 2>/dev/null | wc -l | xargs)

echo "📊 Task Completion: $total_done / $total_tasks ($percent%)"
echo ""

# Generate HTML
cat > "$OUTPUT_FILE" << HTMLHEADER
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SportsMockery Project Status</title>
  <meta http-equiv="refresh" content="30">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a; 
      color: #fff;
      padding: 20px;
      min-height: 100vh;
    }
    h1 { color: #ff0000; margin-bottom: 5px; font-size: 32px; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
    
    .hero-stat {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      margin-bottom: 30px;
      border: 1px solid #333;
    }
    .hero-stat .number {
      font-size: 72px;
      font-weight: bold;
      background: linear-gradient(135deg, #ff0000, #ff4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-stat .label {
      font-size: 18px;
      color: #888;
      margin-top: 10px;
    }
    .hero-stat .detail {
      font-size: 24px;
      color: #fff;
      margin-top: 5px;
    }
    
    .progress-bar-large {
      height: 40px;
      background: #333;
      border-radius: 20px;
      overflow: hidden;
      margin: 20px 0;
    }
    .progress-fill-large {
      height: 100%;
      background: linear-gradient(90deg, #ff0000, #ff4444);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      transition: width 0.5s ease;
    }
    
    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .session-card {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 25px;
      border-left: 4px solid #333;
    }
    .session-card.s1 { border-left-color: #3b82f6; }
    .session-card.s2 { border-left-color: #10b981; }
    .session-card.s3 { border-left-color: #f59e0b; }
    .session-card.s4 { border-left-color: #ef4444; }
    
    .session-card h3 {
      font-size: 14px;
      color: #888;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .session-card .count {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .session-card.s1 .count { color: #3b82f6; }
    .session-card.s2 .count { color: #10b981; }
    .session-card.s3 .count { color: #f59e0b; }
    .session-card.s4 .count { color: #ef4444; }
    
    .session-card .progress-bar {
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
      margin: 10px 0;
    }
    .session-card .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s;
    }
    .session-card.s1 .progress-fill { background: #3b82f6; }
    .session-card.s2 .progress-fill { background: #10b981; }
    .session-card.s3 .progress-fill { background: #f59e0b; }
    .session-card.s4 .progress-fill { background: #ef4444; }
    
    .session-card .status {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 12px;
      display: inline-block;
      margin-top: 10px;
    }
    .status.complete { background: #10b98133; color: #10b981; }
    .status.in-progress { background: #f59e0b33; color: #f59e0b; }
    .status.not-started { background: #ef444433; color: #ef4444; }
    
    .files-section {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .files-section h2 {
      font-size: 18px;
      margin-bottom: 20px;
      color: #fff;
      border-bottom: 2px solid #ff0000;
      padding-bottom: 10px;
    }
    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .file-stat {
      background: #252525;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .file-stat .num {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
    }
    .file-stat .lbl {
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }
    
    .section-breakdown {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .section-breakdown h2 {
      font-size: 18px;
      margin-bottom: 20px;
      color: #fff;
      border-bottom: 2px solid #ff0000;
      padding-bottom: 10px;
    }
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
    }
    .breakdown-table th {
      text-align: left;
      padding: 12px;
      background: #252525;
      color: #888;
      font-size: 12px;
      text-transform: uppercase;
    }
    .breakdown-table td {
      padding: 12px;
      border-bottom: 1px solid #333;
    }
    .breakdown-table .section-name {
      color: #fff;
    }
    .breakdown-table .done { color: #10b981; }
    .breakdown-table .remaining { color: #ef4444; }
    .mini-progress {
      width: 100px;
      height: 6px;
      background: #333;
      border-radius: 3px;
      overflow: hidden;
    }
    .mini-progress-fill {
      height: 100%;
      background: #10b981;
      border-radius: 3px;
    }
    
    .refresh-note {
      text-align: center;
      color: #444;
      font-size: 12px;
      margin-top: 20px;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 20px 0;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #888;
    }
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <h1>🏗️ SportsMockery Project Status</h1>
  <p class="subtitle">Last updated: $(date '+%Y-%m-%d %H:%M:%S') • Auto-refreshes every 30 seconds</p>
  
  <div class="hero-stat">
    <div class="number">${percent}%</div>
    <div class="label">Overall Completion</div>
    <div class="detail">${total_done} of ${total_tasks} tasks complete</div>
    <div class="progress-bar-large">
      <div class="progress-fill-large" style="width: ${percent}%">${total_done} / ${total_tasks}</div>
    </div>
  </div>
  
  <div class="sessions-grid">
    <div class="session-card s1">
      <h3>Session 1 - Design System</h3>
      <div class="count">${s1_done}/${s1_total}</div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${s1_pct}%"></div></div>
      <p style="color: #666; font-size: 13px;">Colors, fonts, header, homepage, dark mode</p>
HTMLHEADER

# Session 1 status
if [ "$s1_pct" -eq 100 ]; then
  echo '      <span class="status complete">✓ Complete</span>' >> "$OUTPUT_FILE"
elif [ "$s1_done" -gt 0 ]; then
  echo '      <span class="status in-progress">In Progress</span>' >> "$OUTPUT_FILE"
else
  echo '      <span class="status not-started">Not Started</span>' >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << HTMLS1END
    </div>
    
    <div class="session-card s2">
      <h3>Session 2 - Articles & Content</h3>
      <div class="count">${s2_done}/${s2_total}</div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${s2_pct}%"></div></div>
      <p style="color: #666; font-size: 13px;">Article cards, pages, categories, authors, search</p>
HTMLS1END

# Session 2 status
if [ "$s2_pct" -eq 100 ]; then
  echo '      <span class="status complete">✓ Complete</span>' >> "$OUTPUT_FILE"
elif [ "$s2_done" -gt 0 ]; then
  echo '      <span class="status in-progress">In Progress</span>' >> "$OUTPUT_FILE"
else
  echo '      <span class="status not-started">Not Started</span>' >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << HTMLS2END
    </div>
    
    <div class="session-card s3">
      <h3>Session 3 - ESPN Data & Teams</h3>
      <div class="count">${s3_done}/${s3_total}</div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${s3_pct}%"></div></div>
      <p style="color: #666; font-size: 13px;">Scores, headlines, team pages, player profiles</p>
HTMLS2END

# Session 3 status
if [ "$s3_pct" -eq 100 ]; then
  echo '      <span class="status complete">✓ Complete</span>' >> "$OUTPUT_FILE"
elif [ "$s3_done" -gt 0 ]; then
  echo '      <span class="status in-progress">In Progress</span>' >> "$OUTPUT_FILE"
else
  echo '      <span class="status not-started">Not Started</span>' >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << HTMLS3END
    </div>
    
    <div class="session-card s4">
      <h3>Session 4 - Admin & Backend</h3>
      <div class="count">${s4_done}/${s4_total}</div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${s4_pct}%"></div></div>
      <p style="color: #666; font-size: 13px;">Auth, admin CMS, posts, media, settings</p>
HTMLS3END

# Session 4 status
if [ "$s4_pct" -eq 100 ]; then
  echo '      <span class="status complete">✓ Complete</span>' >> "$OUTPUT_FILE"
elif [ "$s4_done" -gt 0 ]; then
  echo '      <span class="status in-progress">In Progress</span>' >> "$OUTPUT_FILE"
else
  echo '      <span class="status not-started">Not Started</span>' >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << HTMLFILES
    </div>
  </div>
  
  <div class="files-section">
    <h2>📁 Files Created</h2>
    <div class="files-grid">
      <div class="file-stat">
        <div class="num">${total_files}</div>
        <div class="lbl">Total Files</div>
      </div>
      <div class="file-stat">
        <div class="num">${pages}</div>
        <div class="lbl">Pages</div>
      </div>
      <div class="file-stat">
        <div class="num">${components}</div>
        <div class="lbl">Components</div>
      </div>
      <div class="file-stat">
        <div class="num">${hooks}</div>
        <div class="lbl">Hooks</div>
      </div>
      <div class="file-stat">
        <div class="num">${libs}</div>
        <div class="lbl">Libraries</div>
      </div>
      <div class="file-stat">
        <div class="num">${api_routes}</div>
        <div class="lbl">API Routes</div>
      </div>
    </div>
  </div>
  
  <div class="section-breakdown">
    <h2>📋 Detailed Breakdown</h2>
    <table class="breakdown-table">
      <thead>
        <tr>
          <th>Session / Section</th>
          <th>Done</th>
          <th>Remaining</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
HTMLFILES

# Parse session files for section breakdowns
parse_sections() {
  local file="$1"
  local session_num="$2"
  
  if [ ! -f "$file" ]; then
    return
  fi
  
  current_section=""
  section_done=0
  section_total=0
  
  while IFS= read -r line; do
    # Check for section header
    if echo "$line" | grep -q "^## SECTION"; then
      # Output previous section if exists
      if [ -n "$current_section" ] && [ "$section_total" -gt 0 ]; then
        section_remaining=$((section_total - section_done))
        section_pct=$((section_done * 100 / section_total))
        echo "        <tr>"
        echo "          <td class=\"section-name\">S${session_num}: ${current_section}</td>"
        echo "          <td class=\"done\">${section_done}</td>"
        echo "          <td class=\"remaining\">${section_remaining}</td>"
        echo "          <td><div class=\"mini-progress\"><div class=\"mini-progress-fill\" style=\"width: ${section_pct}%\"></div></div></td>"
        echo "        </tr>"
      fi
      # Start new section
      current_section=$(echo "$line" | sed 's/## SECTION [0-9]*: //' | sed 's/ ([0-9]* tasks)//')
      section_done=0
      section_total=0
    fi
    
    # Count tasks
    if echo "$line" | grep -q "^\- \[x\]"; then
      section_done=$((section_done + 1))
      section_total=$((section_total + 1))
    elif echo "$line" | grep -q "^\- \[ \]"; then
      section_total=$((section_total + 1))
    fi
  done < "$file"
  
  # Output last section
  if [ -n "$current_section" ] && [ "$section_total" -gt 0 ]; then
    section_remaining=$((section_total - section_done))
    section_pct=$((section_done * 100 / section_total))
    echo "        <tr>"
    echo "          <td class=\"section-name\">S${session_num}: ${current_section}</td>"
    echo "          <td class=\"done\">${section_done}</td>"
    echo "          <td class=\"remaining\">${section_remaining}</td>"
    echo "          <td><div class=\"mini-progress\"><div class=\"mini-progress-fill\" style=\"width: ${section_pct}%\"></div></div></td>"
    echo "        </tr>"
  fi
}

parse_sections "$S1_FILE" "1" >> "$OUTPUT_FILE"
parse_sections "$S2_FILE" "2" >> "$OUTPUT_FILE"
parse_sections "$S3_FILE" "3" >> "$OUTPUT_FILE"
parse_sections "$S4_FILE" "4" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << HTMLFOOTER
      </tbody>
    </table>
  </div>
  
  <div class="legend">
    <div class="legend-item">
      <div class="legend-dot" style="background: #10b981;"></div>
      Complete
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #f59e0b;"></div>
      In Progress
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #ef4444;"></div>
      Not Started
    </div>
  </div>
  
  <p class="refresh-note">Page auto-refreshes every 30 seconds • Run ./scan-project.sh to update</p>
</body>
</html>
HTMLFOOTER

echo ""
echo "✅ Report generated: $OUTPUT_FILE"
echo ""
echo "════════════════════════════════════════════"
echo "  SPORTSMOCKERY PROJECT STATUS"
echo "════════════════════════════════════════════"
echo ""
echo "  Overall:  $total_done / $total_tasks tasks ($percent%)"
echo ""
echo "  Session 1 (Design):     $s1_done / $s1_total ($s1_pct%)"
echo "  Session 2 (Articles):   $s2_done / $s2_total ($s2_pct%)"
echo "  Session 3 (ESPN Data):  $s3_done / $s3_total ($s3_pct%)"
echo "  Session 4 (Admin):      $s4_done / $s4_total ($s4_pct%)"
echo ""
echo "  Files Created: $total_files"
echo ""
echo "════════════════════════════════════════════"
echo ""
echo "🌐 Open the report: open $OUTPUT_FILE"
