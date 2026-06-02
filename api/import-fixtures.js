import { fetchNrlRound, supabaseAdmin } from "./_nrlScrape.js";

export default async function handler(req, res) {
  try {
    const season = String(req.query.season || new Date().getFullYear());
    const round = String(req.query.round || "");

    if (!round) {
      return res.status(400).json({ ok: false, error: "Round is required." });
    }

    const rows = await fetchNrlRound(season, round);

    if (!rows.length) {
      return res.status(200).json({
        ok: true,
        imported: 0,
        message: `No fixtures found on NRL website for season ${season}, round ${round}.`,
      });
    }

    const supabase = supabaseAdmin();
    const { error } = await supabase.from("games").upsert(rows, { onConflict: "external_id" });
    if (error) throw error;

    return res.status(200).json({
      ok: true,
      source: "nrl.com scrape",
      imported: rows.length,
      games: rows.map((game) => `${game.home} v ${game.away}`),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}