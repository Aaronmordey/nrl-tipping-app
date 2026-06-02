import { createClient } from "@supabase/supabase-js";

function makeNameFromEmail(email) {
  const local = String(email || "").split("@")[0] || "Player";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use POST." });
    }

    const { email } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) throw new Error("Missing VITE_SUPABASE_URL");
    if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const siteUrl = process.env.VITE_SITE_URL || "https://nrl-tipping-app.vercel.app";

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
      redirectTo: siteUrl,
    });

    if (error) throw error;

    const userId = data?.user?.id;

    if (userId) {
      const profile = {
        id: userId,
        email: cleanEmail,
        name: makeNameFromEmail(cleanEmail),
        role: "player",
      };

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(profile, { onConflict: "id" });

      if (profileError) throw profileError;
    }

    return res.status(200).json({ ok: true, email: cleanEmail });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}