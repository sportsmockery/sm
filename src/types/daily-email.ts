// =============================================================================
// DailyEdgeEmailVariables — the complete data contract for the 6am email
// =============================================================================

export interface ScoreboardGame {
  team_home: string;
  team_away: string;
  score_home: number;
  score_away: number;
  status: string; // "Final", "Final/OT"
  winner: 'home' | 'away' | null;
  url: string;
}

export interface EmailStory {
  title: string;        // ≤ 85 chars, no HTML
  summary: string;      // ≤ 140 chars, no HTML
  category: string;     // "Bears", "Bulls", etc.
  tagline: string;      // e.g. "Bears · Draft"
  image_url: string;    // featured image or empty string
  url: string;
  published_at: string; // ISO 8601
  minutes_read: number; // 3–7
  relative_time: string; // "5 hours ago"
}

export interface NetworkItem {
  name: string;
  description: string;
  logo_url: string;
  url: string;
  color: string; // brand accent
}

export interface DailyEdgeEmailVariables {
  // Header
  date_label: string;             // "Mon, Apr 20 · 6:00 AM CT"
  view_in_browser_url: string;

  // Intro
  intro_blurb: string;            // 1–2 sentences referencing hero + one other story

  // Scoreboard
  scoreboard_games: ScoreboardGame[];

  // Hero
  hero_story: EmailStory;

  // Stories
  more_stories: EmailStory[];     // 4–6 items
  stories_count: string;          // "7"
  stories_window_label: string;   // "last 24 hours"
  all_stories_url: string;

  // Scout AI
  scout_title: string;
  scout_description: string;
  scout_examples: string[];       // 3 questions
  scout_url: string;

  // Network
  network_items: NetworkItem[];

  // App
  app_bullets: string[];          // 3 short strings
  ios_url: string;
  android_url: string;

  // Footer
  unsubscribe_url: string;
  preferences_url: string;
}
