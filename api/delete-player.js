import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use POST." });
    }

    const { playerId } = req.body || {};
    if (!playerId) {
      return res.status(400).json({ ok: false, error: "playerId is required." });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl) throw new Error("Missing VITE_SUPABASE_URL");
    if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await supabaseAdmin.from("tips").delete().eq("player_id", playerId);
    await supabaseAdmin.from("profiles").delete().eq("id", playerId);

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(playerId);
    if (authError && !String(authError.message || "").toLowerCase().includes("not found")) {
      throw authError;
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}