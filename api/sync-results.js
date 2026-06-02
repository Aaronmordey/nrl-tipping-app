import { fetchNrlRound, supabaseAdmin } from "./_nrlScrape.js";

export default async function handler(req, res) {
  try {
    const season = String(req.query.season || new Date().getFullYear());
    const round = req.query.round ? String(req.query.round) : "";

    const supabase = supabaseAdmin();

    let rounds = [];
    if (round) {
      rounds = [round];
    } else {
      const { data: existingGames, error } = await supabase
        .from("games")
        .select("round")
        .eq("season", season);

      if (error) throw error;
      rounds = [...new Set((existingGames || []).map((game) => String(game.round)))];
    }

    let updated = 0;

    for (const roundNumber of rounds) {
      const scraped = await fetchNrlRound(season, roundNumber);
      const completed = scraped.filter((game) => game.home_score !== null && game.away_score !== null);

      for (const game of completed) {
        const { error } = await supabase
          .from("games")
          .update({
            home_score: game.home_score,
            away_score: game.away_score,
            status: "completed",
            locked: true,
          })
          .eq("external_id", game.external_id);

        if (error) throw error;
        updated++;
      }
    }

    return res.status(200).json({ ok: true, source: "nrl.com scrape", updated });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}