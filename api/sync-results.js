import { createClient } from "@supabase/supabase-js";

const NRL_LEAGUE_ID = "4416";

function parseScore(value) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}

export default async function handler(req, res) {
  try {
    const season = String(req.query.season || new Date().getFullYear());

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: games, error: gameError } = await supabase
      .from("games")
      .select("id, external_id")
      .eq("season", season)
      .not("external_id", "is", null);

    if (gameError) throw gameError;

    const url = `https://www.thesportsdb.com/api/v2/json/schedule/league/${NRL_LEAGUE_ID}/${season}`;
    const response = await fetch(url, {
      headers: { "X-API-KEY": process.env.THESPORTSDB_API_KEY || "3" },
    });

    if (!response.ok) throw new Error(`Sports API failed: ${response.status}`);
    const json = await response.json();
    const events = json.schedule || json.events || json.event || [];

    let updated = 0;

    for (const game of games || []) {
      const event = events.find((item) => String(item.idEvent) === String(game.external_id));
      if (!event) continue;

      const homeScore = parseScore(event.intHomeScore);
      const awayScore = parseScore(event.intAwayScore);

      if (homeScore === null || awayScore === null) continue;

      const { error } = await supabase
        .from("games")
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: "completed",
          locked: true,
        })
        .eq("id", game.id);

      if (error) throw error;
      updated++;
    }

    return res.status(200).json({ ok: true, updated });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}