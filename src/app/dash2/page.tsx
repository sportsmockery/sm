// Copy this into v0.app — then ask it to swap mock data for real SportsDataIO / The Odds API / ESPN fetches using env vars
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Trophy,
  Skull,
  Flame,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  Zap,
  Heart,
  HeartCrack,
  Star,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Cell,
  PolarAngleAxis,
} from "recharts";

// ============ TYPES ============
interface Injury {
  name: string;
  status: "Out" | "Questionable" | "Day-To-Day";
  detail: string;
  snark: string;
}

interface TeamData {
  key: string;
  name: string;
  shortName: string;
  emoji: string;
  logo: string;
  color: string;
  colorAccent: string;
  record: string;
  wins: number;
  losses: number;
  otl?: number; // Overtime losses (NHL)
  winPct: number;
  playoffOdds: number;
  streak: string;
  streakType: "W" | "L";
  streakCount: number;
  injuries: Injury[];
  recentForm: number; // wins in last 5
  vibesScore: number;
  hopeScore: number;
  seasonPhase: "Regular Season" | "Playoffs" | "Offseason";
  standingSummary: string;
  lastResult: string;
  nextGame: string | null;
  tagline: string;
}

// ============ VIBE ALGORITHM ============
function calculateVibe(
  winPct: number,
  streakType: "W" | "L",
  streakCount: number
): { label: string; emoji: string; description: string; score: number } {
  const hotStreak = streakType === "W" && streakCount >= 3;
  const coldStreak = streakType === "L" && streakCount >= 3;

  if (winPct >= 65) {
    if (hotStreak)
      return {
        label: "ON FIRE",
        emoji: "🔥",
        description: "These absolute units are cooking right now",
        score: 95,
      };
    return {
      label: "VIBING",
      emoji: "😎",
      description: "Looking good, but don't get cocky",
      score: 85,
    };
  }
  if (winPct >= 55) {
    if (hotStreak)
      return {
        label: "SURGING",
        emoji: "📈",
        description: "Finally showing some life out there",
        score: 75,
      };
    return {
      label: "SOLID",
      emoji: "💪",
      description: "Not embarrassing us for once",
      score: 65,
    };
  }
  if (winPct >= 45) {
    if (hotStreak)
      return {
        label: "HEATING UP",
        emoji: "🌡️",
        description: "Wait... is this hope?",
        score: 55,
      };
    return {
      label: "MEH",
      emoji: "😐",
      description: "Classic mediocrity, Chicago style",
      score: 45,
    };
  }
  if (winPct >= 35) {
    if (coldStreak)
      return {
        label: "PAIN",
        emoji: "😩",
        description: "Why do we keep watching?",
        score: 30,
      };
    return {
      label: "STRUGGLING",
      emoji: "😬",
      description: "At least we have deep dish pizza",
      score: 35,
    };
  }
  if (coldStreak)
    return {
      label: "DUMPSTER FIRE",
      emoji: "🗑️🔥",
      description: "Pour one out for this disaster",
      score: 10,
    };
  return {
    label: "REBUILD MODE",
    emoji: "🏗️",
    description: "Trust the process? More like trust deez nuts",
    score: 20,
  };
}

// ============ HOPE SCORE CALCULATION ============
function calculateHopeScore(team: {
  winPct: number;
  playoffOdds: number;
  recentForm: number;
  injuries: Injury[];
}): number {
  const injuryPenalty = Math.min(team.injuries.filter((i) => i.status === "Out").length * 5, 20);
  const score =
    team.winPct * 0.4 +
    team.playoffOdds * 0.3 +
    (team.recentForm / 5) * 100 * 0.2 -
    injuryPenalty * 0.1;
  return Math.round(Math.max(0, Math.min(100, score)));
}

// ============ SNARKY BLURBS ============
const screwedBlurbs: Record<string, string[]> = {
  bears: [
    "Da Bears are once again finding new ways to break our hearts. At least we'll always have '85.",
    "Another year, another quarterback controversy. Classic Bears football, baby.",
    "The good news? Season tickets are finally affordable. The bad news? You know why.",
  ],
  bulls: [
    "The Bulls are giving us major 'participation trophy' energy right now.",
    "Remember when MJ walked these halls? Pepperidge Farm remembers.",
    "At least DeMar is trying. That's more than we can say about the front office.",
  ],
  cubs: [
    "The Cubs are Cubs-ing so hard right now it's almost impressive.",
    "2016 feels like ancient history. Probably because our playoff hopes are.",
    "Hey, at least Wrigley still sells $15 beers to numb the pain.",
  ],
  whitesox: [
    "South Side bums are tanking so hard we're already scouting 2028 drafts.",
    "The rebuild is rebuilding. It's rebuilds all the way down.",
    "At least the food at the park is cheap? Who are we kidding, nothing helps.",
  ],
  blackhawks: [
    "From dynasty to dumpster fire in record time. That's Chicago, baby.",
    "Connor Bedard can only do so much with these clowns around him.",
    "The United Center is basically a library these days. Very respectful tanking.",
  ],
};

const hopefulBlurbs: Record<string, string[]> = {
  bears: [
    "Wait... are the Bears actually good? Someone check if hell froze over.",
    "Caleb Williams might actually be HIM. Don't jinx it.",
    "Is this what hope feels like? We forgot after 40 years.",
  ],
  bulls: [
    "The Bulls are showing signs of life! Quick, nobody look directly at them.",
    "This squad is cooking. League better watch out fr fr.",
    "Finally playing like we deserve that United Center rent.",
  ],
  cubs: [
    "North Side is buzzing! Wrigleyville might actually be fun this year.",
    "The Cubs remembered how to baseball. Nature is healing.",
    "Playoff push incoming. Hide your beers, the bandwagoners are back.",
  ],
  whitesox: [
    "The White Sox found a pulse! Alert the medical examiner.",
    "South Side miracle incoming? Stranger things have happened.",
    "These boys are actually competing. What timeline is this?",
  ],
  blackhawks: [
    "Bedard is dragging this team to relevance through sheer will.",
    "The rebuild might actually be working? Don't tell Jerry.",
    "Hawks showing some fight! The UC is getting loud again.",
  ],
};

function getBlurb(team: TeamData, rank: number): string {
  const blurbs = rank <= 2 ? screwedBlurbs[team.key] : hopefulBlurbs[team.key];
  return blurbs[Math.floor(Math.random() * blurbs.length)];
}

// ============ CITY VIBES SUBTITLE ============
function getCityVibesSubtitle(avgScore: number): string {
  if (avgScore >= 80) return "Chicago is actually thriving right now. Mark your calendars.";
  if (avgScore >= 65) return "Not bad! We might actually make it through the season.";
  if (avgScore >= 50) return "Classic Chicago mid energy. Could be worse, could be Detroit.";
  if (avgScore >= 35) return "Pour one out for the city. We're taking Ls left and right.";
  if (avgScore >= 20) return "Absolute disaster mode. At least we have food and architecture.";
  return "Rock bottom. The only way is up... right? RIGHT?!";
}

// ============ INITIAL MOCK DATA ============
const initialTeamsData: TeamData[] = [
  {
    key: "bears",
    name: "Chicago Bears",
    shortName: "Bears",
    emoji: "🐻",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
    color: "#0B162A",
    colorAccent: "#C83803",
    record: "8-9",
    wins: 8,
    losses: 9,
    winPct: 47,
    playoffOdds: 12,
    streak: "L2",
    streakType: "L",
    streakCount: 2,
    injuries: [
      { name: "Caleb Williams", status: "Questionable", detail: "Shoulder", snark: "Our franchise hopes are literally questionable" },
      { name: "DJ Moore", status: "Out", detail: "Ankle", snark: "Great, there goes the only guy who can catch" },
      { name: "Montez Sweat", status: "Day-To-Day", detail: "Knee", snark: "Edge rusher edging towards IR" },
    ],
    recentForm: 2,
    vibesScore: 35,
    hopeScore: 28,
    seasonPhase: "Offseason",
    standingSummary: "3rd in NFC North",
    lastResult: "L 17-24 vs GB",
    nextGame: null,
    tagline: "Da Bears — Perpetually Building",
  },
  {
    key: "bulls",
    name: "Chicago Bulls",
    shortName: "Bulls",
    emoji: "🐂",
    logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    color: "#CE1141",
    colorAccent: "#000000",
    record: "32-40",
    wins: 32,
    losses: 40,
    winPct: 44,
    playoffOdds: 25,
    streak: "W2",
    streakType: "W",
    streakCount: 2,
    injuries: [
      { name: "Zach LaVine", status: "Out", detail: "Foot", snark: "Always injured, always expensive" },
      { name: "Lonzo Ball", status: "Out", detail: "Knee", snark: "At this point he's a myth" },
      { name: "Patrick Williams", status: "Questionable", detail: "Ankle", snark: "Mr. Questionable himself" },
    ],
    recentForm: 3,
    vibesScore: 42,
    hopeScore: 35,
    seasonPhase: "Regular Season",
    standingSummary: "10th in Eastern Conference",
    lastResult: "W 112-108 vs CLE",
    nextGame: "vs MIA - Tomorrow 7PM",
    tagline: "Bulls — Play-In Purgatory",
  },
  {
    key: "cubs",
    name: "Chicago Cubs",
    shortName: "Cubs",
    emoji: "🐻",
    logo: "https://a.espncdn.com/i/teamlogos/mlb/500/chc.png",
    color: "#0E3386",
    colorAccent: "#CC3433",
    record: "0-0",
    wins: 0,
    losses: 0,
    winPct: 50,
    playoffOdds: 35,
    streak: "—",
    streakType: "W",
    streakCount: 0,
    injuries: [
      { name: "Seiya Suzuki", status: "Day-To-Day", detail: "Oblique", snark: "Please not again" },
      { name: "Kyle Hendricks", status: "Out", detail: "Shoulder", snark: "The Professor needs sabbatical" },
    ],
    recentForm: 0,
    vibesScore: 50,
    hopeScore: 42,
    seasonPhase: "Offseason",
    standingSummary: "Spring Training",
    lastResult: "Season starts March 27",
    nextGame: "@ SF - March 27",
    tagline: "Cubs — Waiting 'til Next Year (again)",
  },
  {
    key: "whitesox",
    name: "Chicago White Sox",
    shortName: "White Sox",
    emoji: "⚾",
    logo: "https://a.espncdn.com/i/teamlogos/mlb/500/chw.png",
    color: "#27251F",
    colorAccent: "#C4CED4",
    record: "0-0",
    wins: 0,
    losses: 0,
    winPct: 25,
    playoffOdds: 2,
    streak: "—",
    streakType: "L",
    streakCount: 0,
    injuries: [
      { name: "Garrett Crochet", status: "Questionable", detail: "Arm fatigue", snark: "Trade value tanking with the team" },
      { name: "Yoan Moncada", status: "Out", detail: "Back", snark: "The eternal 'what if'" },
    ],
    recentForm: 0,
    vibesScore: 15,
    hopeScore: 12,
    seasonPhase: "Offseason",
    standingSummary: "Projected last in AL Central",
    lastResult: "Lost 121 games in 2024",
    nextGame: "@ CLE - March 27",
    tagline: "White Sox — Historic Tank Mode",
  },
  {
    key: "blackhawks",
    name: "Chicago Blackhawks",
    shortName: "Blackhawks",
    emoji: "🏒",
    logo: "https://a.espncdn.com/i/teamlogos/nhl/500/chi.png",
    color: "#CF0A2C",
    colorAccent: "#000000",
    record: "25-35-8",
    wins: 25,
    losses: 35,
    otl: 8,
    winPct: 37,
    playoffOdds: 1,
    streak: "L4",
    streakType: "L",
    streakCount: 4,
    injuries: [
      { name: "Connor Bedard", status: "Day-To-Day", detail: "Upper body", snark: "The only reason to watch is maybe hurt" },
      { name: "Taylor Hall", status: "Out", detail: "Knee", snark: "The Hart Trophy winner? Never heard of him" },
      { name: "Seth Jones", status: "Questionable", detail: "Lower body", snark: "That contract though..." },
    ],
    recentForm: 1,
    vibesScore: 22,
    hopeScore: 18,
    seasonPhase: "Regular Season",
    standingSummary: "7th in Central Division",
    lastResult: "L 1-4 vs COL",
    nextGame: "vs STL - Tonight 7:30PM",
    tagline: "Blackhawks — Bedard Deserves Better",
  },
];

// ============ VIBES GAUGE COMPONENT ============
function VibesGauge({ score, size = "large" }: { score: number; size?: "large" | "small" }) {
  const data = [{ value: score, fill: "url(#vibeGradient)" }];
  const isLarge = size === "large";

  return (
    <div className={cn("relative", isLarge ? "w-[280px] h-[200px]" : "w-full min-w-[100px] h-[80px]")}>
      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={isLarge ? 200 : 80}>
        <RadialBarChart
          cx="50%"
          cy={isLarge ? "70%" : "100%"}
          innerRadius={isLarge ? "60%" : "70%"}
          outerRadius={isLarge ? "100%" : "100%"}
          barSize={isLarge ? 20 : 10}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <defs>
            <linearGradient id="vibeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: "rgba(0,0,0,0.08)" }}
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      {isLarge && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <span className="text-5xl font-bold text-gray-900 tabular-nums">{score}</span>
          <span className="text-sm text-gray-500 uppercase tracking-wider">/ 100</span>
        </div>
      )}
    </div>
  );
}

// ============ TEAM CARD COMPONENT ============
function TeamCard({ team, rank }: { team: TeamData; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const vibe = calculateVibe(team.winPct, team.streakType, team.streakCount);

  const statusColors: Record<string, string> = {
    Out: "bg-red-100 text-red-700 border-red-200",
    Questionable: "bg-amber-100 text-amber-700 border-amber-200",
    "Day-To-Day": "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const getVibeColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 30) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-white border-gray-200 shadow-sm",
        "hover:border-gray-300 hover:shadow-md",
        expanded && "ring-1 ring-gray-300"
      )}
      style={{ borderLeftColor: team.color, borderLeftWidth: "4px" }}
    >
      {/* Header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <img
              src={team.logo}
              alt={team.name}
              className="w-12 h-12 object-contain"
              crossOrigin="anonymous"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">{team.name}</h3>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  team.seasonPhase === "Regular Season"
                    ? "bg-emerald-100 text-emerald-700"
                    : team.seasonPhase === "Playoffs"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {team.seasonPhase}
              </span>
            </div>
            <p className="text-sm text-gray-500 italic">{team.tagline}</p>
          </div>

          {/* Expand Button */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {/* Record */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{team.record}</div>
            <div className="text-xs text-gray-500 uppercase">Record</div>
          </div>

          {/* Win % */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{team.winPct}%</div>
            <div className="text-xs text-gray-500 uppercase">Win %</div>
          </div>

          {/* Streak */}
          <div className="text-center">
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                team.streakType === "W" ? "text-emerald-600" : "text-red-600"
              )}
            >
              {team.streak}
            </div>
            <div className="text-xs text-gray-500 uppercase">Streak</div>
          </div>

          {/* Playoff Odds */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{team.playoffOdds}%</div>
            <div className="text-xs text-gray-500 uppercase">Playoffs</div>
          </div>
        </div>

        {/* Vibes Section */}
        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{vibe.emoji}</span>
              <span className={cn("font-bold uppercase tracking-wide", getVibeColor(vibe.score))}>
                {vibe.label}
              </span>
            </div>
            <span className="text-sm text-gray-500">{vibe.description}</span>
          </div>
          <VibesGauge score={vibe.score} size="small" />
        </div>

        {/* Last Result & Next Game */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Last:</span>
            <span className={cn("font-medium", team.lastResult.startsWith("W") ? "text-emerald-600" : team.lastResult.startsWith("L") ? "text-red-600" : "text-gray-600")}>
              {team.lastResult}
            </span>
          </div>
          {team.nextGame && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Next:</span>
              <span className="text-blue-600 font-medium">{team.nextGame}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Standing */}
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-gray-700">{team.standingSummary}</span>
          </div>

          {/* Injuries */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Injury Report
            </h4>
            <div className="space-y-2">
              {team.injuries.map((injury, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded-lg bg-gray-50"
                >
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium border shrink-0",
                      statusColors[injury.status]
                    )}
                  >
                    {injury.status.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-gray-900 font-medium">
                      {injury.name} <span className="text-gray-500">({injury.detail})</span>
                    </div>
                    <div className="text-xs text-gray-500 italic">{injury.snark}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hope Score */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-medium text-gray-900">Hope Score™</span>
            </div>
            <span className="text-2xl font-bold text-rose-600 tabular-nums">{team.hopeScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ RANKINGS TABLE COMPONENT ============
function RankingsTable({ teams }: { teams: TeamData[] }) {
  const sortedTeams = [...teams]
    .filter((t) => t.seasonPhase !== "Offseason")
    .sort((a, b) => a.hopeScore - b.hopeScore);

  // If all teams are in offseason, show all teams
  const displayTeams = sortedTeams.length > 0 ? sortedTeams : [...teams].sort((a, b) => a.hopeScore - b.hopeScore);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <Skull className="w-6 h-6 text-red-500" />
          Most Screwed → Most Hopeful Ranking
        </h2>
        <p className="text-sm text-gray-500 mt-1">Sorted by the Hope Score™ algorithm (lower = more screwed)</p>
      </div>

      <div className="divide-y divide-gray-100">
        {displayTeams.map((team, idx) => (
          <div
            key={team.key}
            className={cn(
              "p-4 flex items-center gap-4 transition-colors hover:bg-gray-50",
              idx === 0 && "bg-red-50",
              idx === displayTeams.length - 1 && "bg-emerald-50"
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0",
                idx === 0
                  ? "bg-red-100 text-red-600"
                  : idx === displayTeams.length - 1
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {idx + 1}
            </div>

            {/* Team Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={team.logo}
                alt={team.name}
                className="w-10 h-10 object-contain shrink-0"
                crossOrigin="anonymous"
              />
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{team.name}</div>
                <div className="text-xs text-gray-500">
                  {team.record} • {team.standingSummary}
                </div>
              </div>
            </div>

            {/* Hope Score */}
            <div className="text-right shrink-0">
              <div
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  team.hopeScore >= 50
                    ? "text-emerald-600"
                    : team.hopeScore >= 30
                    ? "text-yellow-600"
                    : "text-red-600"
                )}
              >
                {team.hopeScore}
              </div>
              <div className="text-xs text-gray-500">Hope Score</div>
            </div>

            {/* Blurb */}
            <div className="hidden lg:block text-sm text-gray-500 italic max-w-xs">
              {getBlurb(team, idx + 1)}
            </div>

            {/* Icon */}
            {idx === 0 ? (
              <HeartCrack className="w-5 h-5 text-red-500 shrink-0" />
            ) : idx === displayTeams.length - 1 ? (
              <Star className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <Activity className="w-5 h-5 text-gray-400 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN PAGE COMPONENT ============
export default function ChicagoDashboard() {
  const [teams, setTeams] = useState<TeamData[]>(initialTeamsData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Calculate city-wide metrics
  const cityMetrics = useMemo(() => {
    const inSeasonTeams = teams.filter((t) => t.seasonPhase !== "Offseason");
    const avgVibes =
      inSeasonTeams.length > 0
        ? Math.round(inSeasonTeams.reduce((sum, t) => sum + t.vibesScore, 0) / inSeasonTeams.length)
        : Math.round(teams.reduce((sum, t) => sum + t.vibesScore, 0) / teams.length);

    const totalWins = teams.reduce((sum, t) => sum + t.wins, 0);
    const totalLosses = teams.reduce((sum, t) => sum + t.losses, 0);

    const hottestTeam = [...(inSeasonTeams.length > 0 ? inSeasonTeams : teams)].sort(
      (a, b) => b.vibesScore - a.vibesScore
    )[0];
    const coldestTeam = [...(inSeasonTeams.length > 0 ? inSeasonTeams : teams)].sort(
      (a, b) => a.vibesScore - b.vibesScore
    )[0];

    return {
      avgVibes,
      totalWins,
      totalLosses,
      hottestTeam,
      coldestTeam,
      teamsActive: inSeasonTeams.length,
    };
  }, [teams]);

  // Refresh simulation
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    setTimeout(() => {
      setTeams((prev) =>
        prev.map((team) => {
          // Simulate small random changes
          const newWins = Math.max(0, team.wins + (Math.random() > 0.5 ? 1 : 0));
          const newLosses = Math.max(0, team.losses + (Math.random() > 0.5 ? 1 : 0));
          const newWinPct =
            newWins + newLosses > 0
              ? Math.round((newWins / (newWins + newLosses)) * 100)
              : team.winPct;
          const newRecentForm = Math.max(0, Math.min(5, team.recentForm + (Math.random() > 0.6 ? 1 : -1)));

          const newVibesScore = calculateVibe(
            newWinPct,
            team.streakType,
            team.streakCount
          ).score;
          const newHopeScore = calculateHopeScore({
            winPct: newWinPct,
            playoffOdds: team.playoffOdds,
            recentForm: newRecentForm,
            injuries: team.injuries,
          });

          return {
            ...team,
            wins: newWins,
            losses: newLosses,
            winPct: newWinPct,
            recentForm: newRecentForm,
            vibesScore: newVibesScore,
            hopeScore: newHopeScore,
            record: team.otl !== undefined
              ? `${newWins}-${newLosses}-${team.otl}`
              : `${newWins}-${newLosses}`,
          };
        })
      );
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  }, []);

  // Auto-update timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L35 25H55L39 35L44 55L30 43L16 55L21 35L5 25H25L30 5Z' fill='%23000000' fill-opacity='0.02'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                Sports Mockery
              </span>
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              STATE OF CHICAGO SPORTS
            </h1>
            <p className="text-sm text-red-600 font-medium uppercase tracking-wide mt-1">
              Today&apos;s Damage Report
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">Last Updated</div>
              <div className="text-sm text-gray-700 tabular-nums">
                {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all",
                "bg-red-600 hover:bg-red-500 text-white shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin")}
              />
              REFRESH THE PAIN
            </button>
          </div>
        </header>

        {/* City Vibes Hero */}
        <section className="mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-lg text-gray-500 uppercase tracking-wider mb-2">
                  How Cooked Are We As a City Right Now?
                </h2>
                <p className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">
                  {getCityVibesSubtitle(cityMetrics.avgVibes)}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm">
                  <span className="text-gray-500">
                    <span className="text-emerald-600 font-bold">{cityMetrics.totalWins}</span> Wins
                  </span>
                  <span className="text-gray-500">
                    <span className="text-red-600 font-bold">{cityMetrics.totalLosses}</span> Losses
                  </span>
                  <span className="text-gray-500">
                    <span className="text-blue-600 font-bold">{cityMetrics.teamsActive}</span>/5 Active
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <VibesGauge score={cityMetrics.avgVibes} size="large" />
                <span className="text-sm text-gray-500 mt-2 uppercase tracking-wider">
                  City Vibes Index
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Bar */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* City Pulse */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Activity className="w-4 h-4" />
              City Pulse
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {cityMetrics.totalWins}-{cityMetrics.totalLosses}
            </div>
            <div className="text-xs text-gray-500">Combined Record</div>
          </div>

          {/* Hottest */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-emerald-600 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              Hottest Team
            </div>
            <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <img src={cityMetrics.hottestTeam.logo} alt="" className="w-6 h-6" crossOrigin="anonymous" />
              {cityMetrics.hottestTeam.shortName}
            </div>
            <div className="text-xs text-emerald-600 tabular-nums">
              {cityMetrics.hottestTeam.vibesScore} vibes
            </div>
          </div>

          {/* Coldest */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
              <TrendingDown className="w-4 h-4" />
              Coldest Team
            </div>
            <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <img src={cityMetrics.coldestTeam.logo} alt="" className="w-6 h-6" crossOrigin="anonymous" />
              {cityMetrics.coldestTeam.shortName}
            </div>
            <div className="text-xs text-red-600 tabular-nums">
              {cityMetrics.coldestTeam.vibesScore} vibes
            </div>
          </div>

          {/* Teams Active */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
              <Zap className="w-4 h-4" />
              Teams Active
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {cityMetrics.teamsActive}/5
            </div>
            <div className="text-xs text-gray-500">Currently in-season</div>
          </div>
        </section>

        {/* Team Cards Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Team Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams.map((team, idx) => (
              <TeamCard key={team.key} team={team} rank={idx + 1} />
            ))}
          </div>
        </section>

        {/* Rankings Table */}
        <section className="mb-8">
          <RankingsTable teams={teams} />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Built for the real ones at Sports Mockery • Data refreshed every 60s •{" "}
            <span className="text-red-600">Not responsible for your broken heart</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Logos via ESPN CDN • All trademarks belong to their respective owners
          </p>
        </footer>
      </div>
    </div>
  );
}
