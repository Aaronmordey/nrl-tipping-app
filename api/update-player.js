import { createClient } from "@supabase/supabase-js";

function getToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length);
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use POST." });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl) throw new Error("Missing VITE_SUPABASE_URL");
    if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, error: "Not logged in." });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return res.status(401).json({ ok: false, error: "Invalid login session." });
    }

    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (adminError || adminProfile?.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Admin access required." });
    }

    const { playerId, name, starting_points } = req.body || {};
    if (!playerId) {
      return res.status(400).json({ ok: false, error: "playerId is required." });
    }

    const update = {};
    if (typeof name === "string") {
      const cleanName = name.trim();
      if (!cleanName) return res.status(400).json({ ok: false, error: "Name cannot be blank." });
      update.name = cleanName;
    }

    if (starting_points !== undefined) {
      const points = Number(starting_points);
      if (Number.isNaN(points) || points < 0) {
        return res.status(400).json({ ok: false, error: "Starting points must be 0 or more." });
      }
      update.starting_points = points;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ ok: false, error: "No update supplied." });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(update)
      .eq("id", playerId);

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}