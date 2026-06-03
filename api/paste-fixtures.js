import { createClient } from "@supabase/supabase-js";

const TEAM_ALIASES = {
  "brisbane broncos": "Broncos",
  "broncos": "Broncos",
  "melbourne storm": "Storm",
  "storm": "Storm",
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

const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function normaliseTeam(value) {
  const clean = String(value || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return TEAM_ALIASES[clean.toLowerCase()] || clean;
}

function makeId(season, round, home, away) {
  return `paste-${season}-r${round}-${home.replace(/\W+/g, "").toLowerCase()}-${away.replace(/\W+/g, "").toLowerCase()}`;
}

function toIsoBrisbane(year, month, day, hour, minute) {
  // Brisbane is UTC+10 and does not use daylight savings.
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+10:00`;
}

function parseTime(rawHour, rawMinute, ampm) {
  let hour = Number(rawHour);
  const minute = rawMinute ? Number(rawMinute) : 0;

  if (ampm) {
    const lower = ampm.toLowerCase();
    if (lower === "pm" && hour !== 12) hour += 12;
    if (lower === "am" && hour === 12) hour = 0;
  }

  return { hour, minute };
}

function formatKickoff(dayName, day, month, year, hour, minute) {
  const time12 = (() => {
    const suffix = hour >= 12 ? "pm" : "am";
    const h = hour % 12 || 12;
    return `${h}:${pad(minute)}${suffix}`;
  })();

  const dateText = month ? `${day}/${month}/${year}` : "";
  return [dayName, dateText, time12].filter(Boolean).join(" ");
}

function parseKickoff(line, season) {
  const text = String(line || "").trim();

  // Example: Thu 13 Jun 7:50pm Broncos v Storm
  let m = text.match(/\b(mon|tue|wed|thu|fri|sat|sun)(?:day)?\.?\s+(\d{1,2})\s+([a-z]{3,9})\.?\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (m) {
    const dayName = m[1];
    const day = Number(m[2]);
    const month = MONTHS[m[3].toLowerCase()];
    const year = Number(season);
    const { hour, minute } = parseTime(m[4], m[5], m[6]);
    return {
      kickoff: formatKickoff(dayName, day, month, year, hour, minute),
      kickoff_at: toIsoBrisbane(year, month, day, hour, minute)
    };
  }

  // Example: 13 Jun 7:50pm Broncos v Storm
  m = text.match(/\b(\d{1,2})\s+([a-z]{3,9})\.?\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (m) {
    const day = Number(m[1]);
    const month = MONTHS[m[2].toLowerCase()];
    const year = Number(season);
    const { hour, minute } = parseTime(m[3], m[4], m[5]);
    return {
      kickoff: formatKickoff("", day, month, year, hour, minute),
      kickoff_at: toIsoBrisbane(year, month, day, hour, minute)
    };
  }

  // Example: 13/06/2026 7:50pm Broncos v Storm
  m = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    let year = m[3] ? Number(m[3]) : Number(season);
    if (year < 100) year += 2000;
    const { hour, minute } = parseTime(m[4], m[5], m[6]);
    return {
      kickoff: formatKickoff("", day, month, year, hour, minute),
      kickoff_at: toIsoBrisbane(year, month, day, hour, minute)
    };
  }

  // Example: 2026-06-13 19:50 Broncos v Storm
  m = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})\b/i);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const hour = Number(m[4]);
    const minute = Number(m[5]);
    return {
      kickoff: formatKickoff("", day, month, year, hour, minute),
      kickoff_at: toIsoBrisbane(year, month, day, hour, minute)
    };
  }

  // Example: Thu 7:50pm Broncos v Storm
  m = text.match(/\b(mon|tue|wed|thu|fri|sat|sun)(?:day)?\.?\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (m) {
    const { hour, minute } = parseTime(m[2], m[3], m[4]);
    return {
      kickoff: `${m[1]} ${hour % 12 || 12}:${pad(minute)}${hour >= 12 ? "pm" : "am"}`,
      kickoff_at: null
    };
  }

  // Example: 7:50pm Broncos v Storm
  m = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (m) {
    const { hour, minute } = parseTime(m[1], m[2], m[3]);
    return {
      kickoff: `${hour % 12 || 12}:${pad(minute)}${hour >= 12 ? "pm" : "am"}`,
      kickoff_at: null
    };
  }

  return { kickoff: "TBC", kickoff_at: null };
}

function stripKickoffPrefix(line) {
  return String(line || "")
    .replace(/^\s*(mon|tue|wed|thu|fri|sat|sun)(?:day)?\.?\s+\d{1,2}\s+[a-z]{3,9}\.?\s+\d{1,2}(?::\d{2})?\s*(am|pm)\s+/i, "")
    .replace(/^\s*\d{1,2}\s+[a-z]{3,9}\.?\s+\d{1,2}(?::\d{2})?\s*(am|pm)\s+/i, "")
    .replace(/^\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s+\d{1,2}(?::\d{2})?\s*(am|pm)\s+/i, "")
    .replace(/^\s*\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}\s+/i, "")
    .replace(/^\s*(mon|tue|wed|thu|fri|sat|sun)(?:day)?\.?\s+\d{1,2}(?::\d{2})?\s*(am|pm)\s+/i, "")
    .replace(/^\s*\d{1,2}(?::\d{2})?\s*(am|pm)\s+/i, "")
    .trim();
}

function parseFixtures(text, season, round) {
  const rows = [];
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  for (const originalLine of lines) {
    const kickoff = parseKickoff(originalLine, season);
    const line = stripKickoffPrefix(originalLine);

    const match = line.match(/(.+?)\s+(?:v|vs|versus)\.?\s+(.+)/i);
    if (!match) continue;

    const home = normaliseTeam(match[1]);
    const away = normaliseTeam(
      match[2]
        .replace(/\s+at\s+.+$/i, "")
        .replace(/\s+-\s+.+$/i, "")
        .trim()
    );

    if (!home || !away || home.toLowerCase() === away.toLowerCase()) continue;

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
      <textarea name="fixtures" placeholder="Thu 13 Jun 7:50pm Broncos v Storm&#10;Fri 14 Jun 6:00pm Warriors vs Dragons&#10;Sat 15 Jun 5:30pm Panthers v Eels"></textarea>
      <button type="submit">Import pasted fixtures</button>
    </form>
  </div>
  <div class="box">
    <h3>Best formats</h3>
    <p><code>Thu 13 Jun 7:50pm Broncos v Storm</code></p>
    <p><code>13/06/2026 7:50pm Broncos v Storm</code></p>
    <p><code>2026-06-13 19:50 Broncos v Storm</code></p>
    <p><code>Thu 7:50pm Broncos v Storm</code> works too, but it only saves display text, not a real date for auto-ordering/lockout.</p>
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
      return res.status(200).send(page("No fixtures found. Use lines like: Thu 13 Jun 7:50pm Broncos v Storm"));
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