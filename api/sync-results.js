import { createClient } from "@supabase/supabase-js";

const TEAM_ALIASES = {
  "Brisbane Broncos": "Broncos",
  "Canterbury-Bankstown Bulldogs": "Bulldogs",
  "Canterbury Bulldogs": "Bulldogs",
  "North Queensland Cowboys": "Cowboys",
  "The Dolphins": "Dolphins",
  "Dolphins": "Dolphins",
  "St. George Illawarra Dragons": "Dragons",
  "St George Illawarra Dragons": "Dragons",
  "Parramatta Eels": "Eels",
  "Newcastle Knights": "Knights",
  "Penrith Panthers": "Panthers",
  "South Sydney Rabbitohs": "Rabbitohs",
  "Canberra Raiders": "Raiders",
  "Sydney Roosters": "Roosters",
  "Manly-Warringah Sea Eagles": "Sea Eagles",
  "Manly Sea Eagles": "Sea Eagles",
  "Cronulla-Sutherland Sharks": "Sharks",
  "Cronulla Sharks": "Sharks",
  "Melbourne Storm": "Storm",
  "Gold Coast Titans": "Titans",
  "New Zealand Warriors": "Warriors",
  "Wests Tigers": "Wests Tigers"
};

function cleanText(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function shortTeam(name) {
  const clean = cleanText(name).replace(/\.$/, "");
  return TEAM_ALIASES[clean] || clean;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExternalId(season, round, home, away) {
  return `nrl-site-${season}-r${round}-${home.replace(/\W+/g, "").toLowerCase()}-${away.replace(/\W+/g, "").toLowerCase()}`;
}

function parseRoundPage(html, season, round) {
  const text = stripHtml(html);
  const games = [];
  const seen = new Set();

  const matchRegex = /Match:\s*([A-Z][A-Za-z .'-]+?)\s+vs\.?\s+([A-Z][A-Za-z .'-]+?)(?= Match:| Full Time| Cancelled| Postponed| Venue:| [A-Z][a-z]+ Team|$)/g;
  let match;

  while ((match = matchRegex.exec(text)) !== null) {
    const home = shortTeam(match[1]);
    const away = shortTeam(match[2]);
    const key = `${home}-${away}`;
    if (!seen.has(key) && home && away && home !== away) {
      seen.add(key);
      games.push({
        external_id: makeExternalId(season, round, home, away),
        season: String(season),
        round: Number(round),
        kickoff: "TBC",
        kickoff_at: null,
        home,
        away,
        venue: null,
        home_logo: null,
        away_logo: null,
        locked: false,
        home_score: null,
        away_score: null,
        status: "scheduled",
      });
    }
  }

  const scoreRegex = /home Team\.?\s*([A-Z][A-Za-z .'-]+?)\.?\s*Scored\s+(\d+)\s+points.*?away Team\.?\s*([A-Z][A-Za-z .'-]+?)\.?\s*Scored\s+(\d+)\s+points/gi;
  while ((match = scoreRegex.exec(text)) !== null) {
    const home = shortTeam(match[1]);
    const away = shortTeam(match[3]);
    const key = `${home}-${away}`;
    const row = {
      external_id: makeExternalId(season, round, home, away),
      season: String(season),
      round: Number(round),
      kickoff: "TBC",
      kickoff_at: null,
      home,
      away,
      venue: null,
      home_logo: null,
      away_logo: null,
      locked: true,
      home_score: Number(match[2]),
      away_score: Number(match[4]),
      status: "completed",
    };

    const existing = games.findIndex((game) => game.external_id === row.external_id);
    if (existing >= 0) games[existing] = { ...games[existing], ...row };
    else if (!seen.has(key)) {
      seen.add(key);
      games.push(row);
    }
  }

  return games;
}

async function fetchNrlRound(season, round) {
  const urls = [
    `https://www.nrl.com/draw/nrl-premiership/${season}/round-${round}/`,
    `https://www.nrl.com/draw/?competition=111&round=${round}&season=${season}`,
  ];

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 NRL tipping app fixture sync",
          "Accept": "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) {
        lastError = new Error(`NRL page failed: ${response.status}`);
        continue;
      }

      const html = await response.text();
      const games = parseRoundPage(html, season, round);
      if (games.length) return games;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return [];
}

function supabaseAdmin() {
  if (!process.env.VITE_SUPABASE_URL) throw new Error("Missing VITE_SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}


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
    return res.status(500).json({ ok: false, error: error.message, stack: error.stack });
  }
}