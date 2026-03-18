Architecture and data source (revised)
Frontend consumer: test.sportsmockery.com
​

Backend: https://datalab.sportsmockery.com
​

Intelligence layer: pre-computed snapshots stored in dashboard_intelligence_snapshot and exposed via a single intelligence API.
​

The dashboard does not call ESPN directly. It consumes a single, opinionated payload from DataLab that already includes records, trends, vibes, injuries, city overview, and drilldowns.

The intelligence flow:

DataLab cron (refresh-dashboard) runs every 5 minutes and computes the full Chicago sports intelligence payload.
​

Results are stored in dashboard_intelligence_snapshot (Supabase) as JSON payload plus computed_at and computation_ms.
​

The dashboard frontend reads from this snapshot (Supabase-first) or calls the DataLab API as a fallback.
​

Data access in the dashboard
Primary: Supabase snapshot read (server-side on test.sportsmockery.com)
Frontends can read directly from Supabase using service role keys on the server, then pass the payload into the React tree as props.
​

ts
// Pseudocode for Next.js server-side data load
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data } = await supabase
  .from("dashboard_intelligence_snapshot")
  .select("payload, computed_at, computation_ms")
  .eq("snapshot_type", "full")
  .single();

const intelligencePayload = data?.payload; // Full DashboardIntelligencePayload
If the snapshot is older than ~10 minutes, the frontend is allowed to call the API fallback.
​

Fallback: DataLab intelligence API
text
GET https://datalab.sportsmockery.com/api/dashboard/intelligence
Query parameters supported (use as needed in the dashboard UI):
​

team: bears | bulls | blackhawks | cubs | whitesox

live: boolean (only live game slice)

refresh: boolean (force fresh computation; bypass snapshot)

section: comma-separated sections: cityOverview,teamMatrix,trends
​

In the v0 UI, you can assume the default call is:

text
GET https://datalab.sportsmockery.com/api/dashboard/intelligence?section=cityOverview,teamMatrix,trends
and that the response shape is:

ts
{
  success: boolean;
  meta: DashboardMeta;
  cityOverview: CityOverview;
  teamMatrix: TeamMatrixRow[];
  liveGames: LiveGameCommand[];
  trends: TrendDetection;
  teamDrilldowns: Record<TeamKey, TeamDrilldown>;
  leaderboards: Leaderboards;
  _servedFrom: "snapshot" | "computed" | "stale_fallback";
  _servedMs: number;
}
The dashboard’s sections should map directly onto:

Executive bar + KPI cards: meta + cityOverview (combinedRecord, cityMood, hottest/coldest, teamsActive, biggestChange24h, nextMajorEvent).
​

Ranking table + risk matrix: teamMatrix rows (record, streak, momentumScore, pressureIndex, heatIndex, availabilityScore, consistencyScore, standingsContext, keyTakeaway).
​

Team-focused panels: teamDrilldowns[teamKey] plus teamMatrix row for that team.

Live band / in-game strip: liveGames (when non-empty).
​

Trends / momentum visuals: trends and any trend items (biggestRiser, biggestDrop, streakChanges, etc.).
​

