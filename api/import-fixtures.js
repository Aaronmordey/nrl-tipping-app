import { createClient } from "@supabase/supabase-js";

const NRL_LEAGUE_ID = "4416";

function parseSportsDate(event) {
  const rawDate = event.dateEvent || event.dateEventLocal;
  const rawTime = event.strTime || event.strTimeLocal || "00:00:00";
  if (!rawDate) return null;
  const time = rawTime.includes("+") ? rawTime.split("+")[0] : rawTime;
  return new Date(`${rawDate}T${time.endsWith("Z") ? time : time + "Z"}`).toISOString();
}

function normalizeSportsEvent(event, season) {
  const home = event.strHomeTeam || event.strHome || "Home Team";
  const away = event.strAwayTeam || event.strAway || "Away Team";
  const homeScore = event.intHomeScore === null || event.intHomeScore === undefined || event.intHomeScore === "" ? null : Number(event.intHomeScore);
  const awayScore = event.intAwayScore === null || event.intAwayScore === undefined || event.intAwayScore === "" ? null : Number(event.intAwayScore);
  const kickoffAt = parseSportsDate(event);

  return {
    external_id: String(event.idEvent),
    season: String(season || event.strSeason || new Date().getFullYear()),
    round: Number(event.intRound || event.intRoundNumber || 1),
    kickoff: event.dateEvent || "TBC",
    kickoff_at: kickoffAt,
    home,
    away,
    venue: event.strVenue || null,
    home_logo: event.strHomeTeamBadge || null,
    away_logo: event.strAwayTeamBadge || null,
    locked: false,
    home_score: homeScore,
    away_score: awayScore,
    status: homeScore !== null && awayScore !== null ? "completed" : "scheduled",
  };
}

export default async function handler(req, res) {
  try {
    const season = String(req.query.season || new Date().getFullYear());
    const round = String(req.query.round || "");

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const url = `https://www.thesportsdb.com/api/v2/json/schedule/league/${NRL_LEAGUE_ID}/${season}`;
    const response = await fetch(url, {
      headers: { "X-API-KEY": process.env.THESPORTSDB_API_KEY || "3" },
    });

    if (!response.ok) throw new Error(`Sports API failed: ${response.status}`);
    const json = await response.json();
    const events = json.schedule || json.events || json.event || [];

    const filtered = round
      ? events.filter((event) => String(event.intRound || event.intRoundNumber || "") === round)
      : events;

    const rows = filtered.map((event) => normalizeSportsEvent(event, season));

    if (!rows.length) {
      return res.status(200).json({ ok: true, imported: 0, message: "No fixtures found." });
    }

    const { error } = await supabase.from("games").upsert(rows, { onConflict: "external_id" });
    if (error) throw error;

    return res.status(200).json({ ok: true, imported: rows.length });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}