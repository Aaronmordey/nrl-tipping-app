import { createClient } from "@supabase/supabase-js";

const TEAMS = [
  "Broncos", "Storm", "Warriors", "Dragons", "Panthers", "Eels", "Cowboys", "Raiders",
  "Rabbitohs", "Roosters", "Sharks", "Bulldogs", "Sea Eagles", "Knights", "Titans",
  "Wests Tigers", "Tigers", "Dolphins"
];

const TEAM_ALIASES = {
  "brisbane broncos": "Broncos",
  "melbourne storm": "Storm",
  "new zealand warriors": "Warriors",
  "warriors": "Warriors",
  "st george illawarra dragons": "Dragons",
  "st. george illawarra dragons": "Dragons",
  "dragons": "Dragons",
  "penrith panthers": "Panthers",
  "panthers": "Panthers",
  "parramatta eels": "Eels",
  "eels": "Eels",
  "north queensland cowboys": "Cowboys",
  "cowboys": "Cowboys",
  "canberra raiders": "Raiders",
  "raiders": "Raiders",
  "south sydney rabbitohs": "Rabbitohs",
  "rabbitohs": "Rabbitohs",
  "sydney roosters": "Roosters",
  "roosters": "Roosters",
  "cronulla sharks": "Sharks",
  "cronulla-sutherland sharks": "Sharks",
  "sharks": "Sharks",
  "canterbury bulldogs": "Bulldogs",
  "canterbury-bankstown bulldogs": "Bulldogs",
  "bulldogs": "Bulldogs",
  "manly sea eagles": "Sea Eagles",
  "manly-warringah sea eagles": "Sea Eagles",
  "sea eagles": "Sea Eagles",
  "newcastle knights": "Knights",
  "knights": "Knights",
  "gold coast titans": "Titans",
  "titans": "Titans",
  "wests tigers": "Wests Tigers",
  "tigers": "Wests Tigers",
  "dolphins": "Dolphins",
  "the dolphins": "Dolphins"
};

function normaliseTeam(value) {
  const clean = String(value || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const lower = clean.toLowerCase();
  return TEAM_ALIASES[lower] || clean;
}

function makeId(season, round, home, away) {
  return `paste-${season}-r${round}-${home.replace(/\W+/g, "").toLowerCase()}-${away.replace(/\W+/g, "").toLowerCase()}`;
}

function parseKickoff(line, season) {
  // This is intentionally forgiving. It stores display text even if it cannot parse a datetime.
  const timeMatch = line.match(/(?:mon|tue|wed|thu|fri|sat|sun)?\.?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!timeMatch) return { kickoff: "TBC", kickoff_at: null };

  return {
    kickoff: timeMatch[0].trim(),
    kickoff_at: null
  };
}

function parseFixtures(text, season, round) {
  const rows = [];
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    let match = line.match(/(.+?)\s+(?:v|vs|versus)\.?\s+(.+)/i);
    if (!match) continue;

    let left = match[1]
      .replace(/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s*/i, "")
      .replace(/\d{1,2}:?\d{0,2}\s*(am|pm)/i, "")
      .trim();

    let right = match[2]
      .replace(/\d{1,2}:?\d{0,2}\s*(am|pm).*/i, "")
      .replace(/\s+at\s+.+$/i, "")
      .replace(/\s+-\s+.+$/i, "")
      .trim();

    const home = normaliseTeam(left);
    const away = normaliseTeam(right);

    if (!home || !away || home.toLowerCase() === away.toLowerCase()) continue;

    const kickoff = parseKickoff(line, season);

    rows.push({
      external_id: makeId(season, round, home, away),
      season: String(season),
      round: Number(round),
      kickoff: kickoff.kickoff,
      kickoff_at: kickoff.kickoff_at,
      home,
      away,
      venue: null,
      home_logo: null,
      away_logo: null,
      locked: false,
      home_score: null,
      away_score: null,
      status: "scheduled"
    });
  }

  return rows;
}

function page(message = "") {
  return `<!doctype html>
<html>
<head>
  <title>Paste NRL Fixtures</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body{font-family:Arial,sans-serif;background:#020617;color:white;padding:24px;max-width:850px;margin:auto}
    input,textarea,button{font:inherit;border-radius:12px;border:0;padding:12px;margin:6px 0;width:100%;box-sizing:border-box}
    textarea{min-height:260px}
    button{background:#5fd394;font-weight:700;cursor:pointer}
    .box{background:#111827;padding:20px;border-radius:20px;margin-top:18px}
    .msg{background:#173e2b;padding:14px;border-radius:14px;margin:14px 0}
    code{background:#0f172a;padding:3px 6px;border-radius:6px}
  </style>
</head>
<body>
  <h1>Paste NRL Fixtures</h1>
  ${message ? `<div class="msg">${message}</div>` : ""}
  <div class="box">
    <form method="POST">
      <label>Season</label>
      <input name="season" value="2026">
      <label>Round</label>
      <input name="round" value="1">
      <label>Fixtures</label>
      <textarea name="fixtures" placeholder="Broncos v Storm&#10;Warriors vs Dragons&#10;Panthers v Eels"></textarea>
      <button type="submit">Import pasted fixtures</button>
    </form>
  </div>
  <div class="box">
    <h3>Example format</h3>
    <p><code>Broncos v Storm</code></p>
    <p><code>Thu 7:50pm Broncos v Storm</code></p>
    <p><code>Warriors vs Dragons</code></p>
  </div>
</body>
</html>`;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(page());
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use GET or POST." });
    }

    const body = await readBody(req);
    const params = new URLSearchParams(body);
    const season = params.get("season") || String(new Date().getFullYear());
    const round = params.get("round") || "1";
    const fixtures = params.get("fixtures") || "";

    const rows = parseFixtures(fixtures, season, round);

    if (!rows.length) {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(page("No fixtures found. Use lines like: Broncos v Storm"));
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase.from("games").upsert(rows, { onConflict: "external_id" });
    if (error) throw error;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(page(`Imported ${rows.length} fixtures for season ${season}, round ${round}. Go back to the app and refresh.`));
  } catch (error) {
    res.setHeader("Content-Type", "text/html");
    return res.status(500).send(page(`Error: ${error.message}`));
  }
}