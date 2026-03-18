"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Zap, TrendingUp, TrendingDown, Eye, HelpCircle, Vote } from "lucide-react";

// ============ TYPES ============
interface TeamChip {
  key: string;
  name: string;
  logo: string;
  color: string;
  vibe: "fire" | "hot" | "mid" | "cold" | "ice";
  streak: ("W" | "L")[];
  urgency: "LIVE" | "TONIGHT" | "HOT" | "COLD" | null;
  vibeScore: number;
}

interface CityState {
  headline: string;
  mood: { emoji: string; label: string };
  subline: string;
  whatsNext: string;
  sinceYouLeft: {
    summary: string;
    chips: { type: "W" | "L" | "STREAK"; value: string }[];
  };
  insight: {
    headline: string;
    stat: string;
  };
  poll: {
    question: string;
    teamKey: string;
  };
}

// ============ MOCK DATA ============
const teamsData: TeamChip[] = [
  {
    key: "bulls",
    name: "Bulls",
    logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    color: "#CE1141",
    vibe: "mid",
    streak: ["W", "W", "L", "L", "W"],
    urgency: "TONIGHT",
    vibeScore: 42,
  },
  {
    key: "blackhawks",
    name: "Hawks",
    logo: "https://a.espncdn.com/i/teamlogos/nhl/500/chi.png",
    color: "#CF0A2C",
    vibe: "cold",
    streak: ["L", "L", "L", "L", "W"],
    urgency: "COLD",
    vibeScore: 22,
  },
  {
    key: "bears",
    name: "Bears",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
    color: "#0B162A",
    vibe: "mid",
    streak: ["L", "L", "W", "L", "W"],
    urgency: null,
    vibeScore: 35,
  },
  {
    key: "cubs",
    name: "Cubs",
    logo: "https://a.espncdn.com/i/teamlogos/mlb/500/chc.png",
    color: "#0E3386",
    vibe: "mid",
    streak: [],
    urgency: null,
    vibeScore: 50,
  },
  {
    key: "whitesox",
    name: "Sox",
    logo: "https://a.espncdn.com/i/teamlogos/mlb/500/chw.png",
    color: "#27251F",
    vibe: "ice",
    streak: [],
    urgency: "COLD",
    vibeScore: 15,
  },
];

function getCityState(teams: TeamChip[]): CityState {
  // Find the team dragging or carrying the city
  const activeTeams = teams.filter(t => t.urgency !== null || t.streak.length > 0);
  const sortedByVibe = [...teams].sort((a, b) => b.vibeScore - a.vibeScore);
  const hottestTeam = sortedByVibe[0];
  const coldestTeam = sortedByVibe[sortedByVibe.length - 1];
  
  const avgVibe = teams.reduce((sum, t) => sum + t.vibeScore, 0) / teams.length;
  
  // Determine headline based on city state
  let headline: string;
  let mood: { emoji: string; label: string };
  
  if (avgVibe >= 60) {
    headline = `${hottestTeam.name} are carrying Chicago right now`;
    mood = { emoji: "🔥", label: "On Fire" };
  } else if (avgVibe >= 45) {
    headline = "Chicago sports are giving mixed signals";
    mood = { emoji: "😤", label: "Frustrated" };
  } else if (avgVibe >= 30) {
    headline = `${coldestTeam.name} are dragging the city down`;
    mood = { emoji: "😩", label: "Pain" };
  } else {
    headline = "It's rough out here for Chicago sports";
    mood = { emoji: "💀", label: "Pain" };
  }

  // Find tonight's game
  const tonightTeam = teams.find(t => t.urgency === "TONIGHT" || t.urgency === "LIVE");
  const whatsNext = tonightTeam 
    ? `${tonightTeam.name} play tonight at 7:30 PM`
    : "No games tonight — breathe easy";

  return {
    headline,
    mood,
    subline: avgVibe >= 45 
      ? "The vibes aren't terrible for once. Don't get used to it."
      : "Classic Chicago. Pain is a lifestyle.",
    whatsNext,
    sinceYouLeft: {
      summary: "Bulls won twice, Hawks lost four straight",
      chips: [
        { type: "W", value: "2" },
        { type: "L", value: "4" },
        { type: "STREAK", value: "L4 Hawks" },
      ],
    },
    insight: {
      headline: "Hawks on worst streak since January",
      stat: "Bedard scoreless in last 3 games",
    },
    poll: {
      question: "Do the Bulls win tonight?",
      teamKey: "bulls",
    },
  };
}

// ============ VIBE STYLES ============
function getVibeStyles(vibe: TeamChip["vibe"]) {
  switch (vibe) {
    case "fire":
      return { bg: "bg-orange-500", text: "text-orange-400", glow: "shadow-orange-500/30" };
    case "hot":
      return { bg: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/30" };
    case "mid":
      return { bg: "bg-yellow-500", text: "text-yellow-400", glow: "shadow-yellow-500/30" };
    case "cold":
      return { bg: "bg-blue-500", text: "text-blue-400", glow: "shadow-blue-500/30" };
    case "ice":
      return { bg: "bg-cyan-500", text: "text-cyan-400", glow: "shadow-cyan-500/30" };
  }
}

function getUrgencyStyles(urgency: TeamChip["urgency"]) {
  switch (urgency) {
    case "LIVE":
      return "bg-red-500 text-white animate-pulse";
    case "TONIGHT":
      return "bg-amber-500 text-black";
    case "HOT":
      return "bg-emerald-500 text-white";
    case "COLD":
      return "bg-blue-500 text-white";
    default:
      return "";
  }
}

// ============ TEAM CHIP COMPONENT ============
function TeamChipComponent({ team }: { team: TeamChip }) {
  const vibeStyles = getVibeStyles(team.vibe);
  
  return (
    <div 
      className={cn(
        "shrink-0 w-[140px] snap-start",
        "bg-white/5 backdrop-blur-sm rounded-2xl p-3",
        "border border-white/10 hover:border-white/20 transition-all",
        "cursor-pointer active:scale-95"
      )}
    >
      {/* Urgency Tag */}
      {team.urgency && (
        <div className={cn(
          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-2",
          getUrgencyStyles(team.urgency)
        )}>
          {team.urgency}
        </div>
      )}
      
      {/* Logo & Name */}
      <div className="flex items-center gap-2 mb-2">
        <img 
          src={team.logo} 
          alt={team.name}
          className="w-8 h-8 object-contain"
          crossOrigin="anonymous"
        />
        <span className="text-white font-semibold text-sm">{team.name}</span>
      </div>
      
      {/* Vibe Indicator */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className={cn("w-2 h-2 rounded-full", vibeStyles.bg)} />
        <span className={cn("text-xs font-medium uppercase", vibeStyles.text)}>
          {team.vibe}
        </span>
      </div>
      
      {/* Streak Dots */}
      {team.streak.length > 0 && (
        <div className="flex gap-1">
          {team.streak.slice(-5).map((result, i) => (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                result === "W" 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function CityPulsePage() {
  const [teams] = useState<TeamChip[]>(teamsData);
  const [pollVote, setPollVote] = useState<"yes" | "no" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const cityState = useMemo(() => getCityState(teams), [teams]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-[600px] mx-auto px-4 py-6 space-y-6">
        
        {/* ========== 1. HEADLINE ========== */}
        <section>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
            {cityState.headline}
          </h1>
        </section>

        {/* ========== 2. CITY MOOD ========== */}
        <section className="flex items-center gap-3">
          <span className="text-4xl">{cityState.mood.emoji}</span>
          <span className="text-lg font-semibold text-white/80">{cityState.mood.label}</span>
        </section>

        {/* ========== 3. SUBLINE ========== */}
        <section>
          <p className="text-base text-white/60 leading-relaxed">
            {cityState.subline}
          </p>
        </section>

        {/* ========== 4. WHAT'S NEXT ========== */}
        <section className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 font-medium">{cityState.whatsNext}</span>
        </section>

        {/* ========== 5. TEAM STRIP (HORIZONTAL SCROLL) ========== */}
        <section className="-mx-4">
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {teams.map((team) => (
              <TeamChipComponent key={team.key} team={team} />
            ))}
          </div>
        </section>

        {/* ========== 6. SINCE YOU LEFT ========== */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/40 uppercase tracking-wider font-medium">
            <TrendingUp className="w-4 h-4" />
            Since You Left
          </div>
          <p className="text-white/70 text-sm">{cityState.sinceYouLeft.summary}</p>
          <div className="flex gap-2">
            {cityState.sinceYouLeft.chips.map((chip, i) => (
              <div 
                key={i}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  chip.type === "W" && "bg-emerald-500/20 text-emerald-400",
                  chip.type === "L" && "bg-red-500/20 text-red-400",
                  chip.type === "STREAK" && "bg-white/10 text-white/70"
                )}
              >
                {chip.type === "STREAK" ? chip.value : `${chip.type} ${chip.value}`}
              </div>
            ))}
          </div>
        </section>

        {/* ========== 7. ONE INSIGHT ========== */}
        <section className="space-y-1">
          <p className="text-white font-semibold">{cityState.insight.headline}</p>
          <p className="text-white/50 text-sm">{cityState.insight.stat}</p>
        </section>

        {/* ========== 8. MICRO INTERACTION (POLL) ========== */}
        <section className="space-y-3">
          <p className="text-white font-medium">{cityState.poll.question}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setPollVote("yes")}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                pollVote === "yes"
                  ? "bg-emerald-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              Yes
            </button>
            <button
              onClick={() => setPollVote("no")}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                pollVote === "no"
                  ? "bg-red-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              No
            </button>
          </div>
          {pollVote && (
            <p className="text-center text-white/40 text-xs">
              {pollVote === "yes" ? "67% agree with you" : "33% agree with you"}
            </p>
          )}
        </section>

        {/* ========== 9. CTA ROW ========== */}
        <section className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm transition-all active:scale-95 hover:bg-white/90">
            <Eye className="w-4 h-4" />
            See Full Picture
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 text-white font-semibold text-sm transition-all active:scale-95 hover:bg-white/15">
            <HelpCircle className="w-4 h-4" />
            What Should I Know
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 text-white font-semibold text-sm transition-all active:scale-95 hover:bg-white/15">
            <Vote className="w-4 h-4" />
          </button>
        </section>

        {/* Bottom Padding for Mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
}
