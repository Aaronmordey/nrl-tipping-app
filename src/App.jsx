import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Users, Lock, CalendarDays, Settings, CheckCircle2, LogOut, UserPlus, Database, Shield, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", children, ...props }) {
  return <button className={`inline-flex items-center justify-center px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>{children}</button>;
}

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

const STORAGE_KEY = "nrl-tipping-comp-preview-v2";

const previewPlayers = [
  { id: "admin", name: "Aaron", email: "admin@nrltips.com", role: "admin" },
  { id: "p2", name: "Ivy", email: "ivy@test.com", role: "player" },
  { id: "p3", name: "Mick", email: "mick@test.com", role: "player" },
];

const previewGames = [
  { id: "g1", round: 1, kickoff: "Thu 7:50pm", home: "Broncos", away: "Storm", locked: false, home_score: null, away_score: null },
  { id: "g2", round: 1, kickoff: "Fri 6:00pm", home: "Warriors", away: "Dragons", locked: false, home_score: null, away_score: null },
  { id: "g3", round: 1, kickoff: "Fri 8:00pm", home: "Panthers", away: "Eels", locked: false, home_score: null, away_score: null },
  { id: "g4", round: 1, kickoff: "Sat 5:30pm", home: "Cowboys", away: "Raiders", locked: false, home_score: null, away_score: null },
  { id: "g5", round: 1, kickoff: "Sat 7:35pm", home: "Rabbitohs", away: "Roosters", locked: false, home_score: null, away_score: null },
  { id: "g6", round: 1, kickoff: "Sun 2:00pm", home: "Sharks", away: "Bulldogs", locked: false, home_score: null, away_score: null },
  { id: "g7", round: 1, kickoff: "Sun 4:05pm", home: "Sea Eagles", away: "Knights", locked: false, home_score: null, away_score: null },
  { id: "g8", round: 1, kickoff: "Sun 6:15pm", home: "Titans", away: "Tigers", locked: false, home_score: null, away_score: null },
];

const previewTips = [
  { id: "t1", player_id: "p2", game_id: "g1", winner: "Storm", margin: "1-12" },
  { id: "t2", player_id: "p2", game_id: "g2", winner: "Warriors", margin: "13+" },
  { id: "t3", player_id: "p3", game_id: "g1", winner: "Broncos", margin: "1-12" },
];

const previewDatabase = {
  currentUser: null,
  players: previewPlayers,
  games: previewGames,
  tips: previewTips,
};

function loadPreviewDatabase() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : previewDatabase;
  } catch {
    return previewDatabase;
  }
}

function savePreviewDatabase(database) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function getResult(game) {
  if (game.home_score === null || game.home_score === "" || game.away_score === null || game.away_score === "") return null;
  const homeScore = Number(game.home_score);
  const awayScore = Number(game.away_score);
  if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || homeScore === awayScore) return null;
  const winner = homeScore > awayScore ? game.home : game.away;
  const marginPoints = Math.abs(homeScore - awayScore);
  const margin = marginPoints <= 12 ? "1-12" : "13+";
  return { winner, margin, marginPoints };
}

function scoreTip(tip, result) {
  if (!tip || !result) return 0;
  if (tip.winner !== result.winner) return 0;
  return tip.margin === result.margin ? 5 : 2;
}

export default function NRLTippingApp() {
  const [database, setDatabase] = useState(previewDatabase);
  const [activeTab, setActiveTab] = useState("tips");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentUser = database.currentUser;
  const isAdmin = currentUser?.role === "admin";
  const playerTips = database.tips.filter((tip) => tip.player_id === currentUser?.id);

  async function refreshSupabaseData(userProfile = currentUser) {
    if (!supabase || !userProfile) return;
    setLoading(true);

    const [{ data: profiles, error: profilesError }, { data: games, error: gamesError }, { data: tips, error: tipsError }] = await Promise.all([
      supabase.from("profiles").select("id,name,email,role").order("name"),
      supabase.from("games").select("id,round,kickoff,home,away,locked,home_score,away_score").order("round").order("kickoff"),
      supabase.from("tips").select("id,player_id,game_id,winner,margin,updated_at"),
    ]);

    if (profilesError || gamesError || tipsError) {
      setAuthError(profilesError?.message || gamesError?.message || tipsError?.message || "Could not load database.");
      setLoading(false);
      return;
    }

    const freshProfile = profiles.find((profile) => profile.id === userProfile.id) || userProfile;
    setDatabase({ currentUser: freshProfile, players: profiles || [], games: games || [], tips: tips || [] });
    setLoading(false);
  }

  useEffect(() => {
    async function boot() {
      if (!hasSupabase) {
        setDatabase(loadPreviewDatabase());
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("id,name,email,role").eq("id", user.id).single();
      if (profile) await refreshSupabaseData(profile);
      setLoading(false);
    }

    boot();
  }, []);

  useEffect(() => {
    if (!hasSupabase) savePreviewDatabase(database);
  }, [database]);

  const leaderboard = useMemo(() => {
    return database.players
      .map((player) => {
        const total = database.games.reduce((sum, game) => {
          const tip = database.tips.find((item) => item.player_id === player.id && item.game_id === game.id);
          return sum + scoreTip(tip, getResult(game));
        }, 0);
        const submitted = database.tips.filter((tip) => tip.player_id === player.id).length;
        return { ...player, total, submitted };
      })
      .sort((a, b) => b.total - a.total || b.submitted - a.submitted || a.name.localeCompare(b.name));
  }, [database]);

  const completedGames = database.games.filter((game) => getResult(game)).length;

  async function handleAuth(event) {
    event.preventDefault();
    setAuthError("");
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password.trim();
    const name = authForm.name.trim();

    if (!email || !password || (authMode === "register" && !name)) {
      setAuthError("Please fill in the required fields.");
      return;
    }

    if (!hasSupabase) {
      if (authMode === "register") {
        const exists = database.players.some((player) => player.email.toLowerCase() === email);
        if (exists) return setAuthError("That email is already registered in preview mode.");
        const newPlayer = { id: makeId("player"), name, email, role: "player" };
        setDatabase({ ...database, currentUser: newPlayer, players: [...database.players, newPlayer] });
        return;
      }
      const fallbackUser = database.players.find((player) => player.email.toLowerCase() === email) || database.players[0];
      setDatabase({ ...database, currentUser: fallbackUser });
      return;
    }

    setSaving(true);

    if (authMode === "register") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setSaving(false);
        return setAuthError(error.message);
      }

      const user = data?.user;
      if (!user) {
        setSaving(false);
        return setAuthError("Check your email to confirm your account, then log in.");
      }

      const profile = { id: user.id, name, email, role: "player" };
      const { error: profileError } = await supabase.from("profiles").insert(profile);
      if (profileError) {
        setSaving(false);
        return setAuthError(profileError.message);
      }

      await refreshSupabaseData(profile);
      setSaving(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSaving(false);
      return setAuthError(error.message);
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").select("id,name,email,role").eq("id", data.user.id).single();
    if (profileError) {
      setSaving(false);
      return setAuthError(profileError.message);
    }

    await refreshSupabaseData(profile);
    setSaving(false);
  }

  async function logout() {
    if (hasSupabase) await supabase.auth.signOut();
    setDatabase({ ...database, currentUser: null });
    setAuthForm({ name: "", email: "", password: "" });
    setActiveTab("tips");
  }

  async function updateTip(gameId, update) {
    if (!currentUser) return;
    const game = database.games.find((item) => item.id === gameId);
    if (game?.locked) return;

    const existingTip = database.tips.find((tip) => tip.player_id === currentUser.id && tip.game_id === gameId);
    const nextTip = {
      id: existingTip?.id || makeId("tip"),
      player_id: currentUser.id,
      game_id: gameId,
      winner: existingTip?.winner || game.home,
      margin: existingTip?.margin || "1-12",
      ...update,
    };

    if (!hasSupabase) {
      setDatabase({
        ...database,
        tips: existingTip ? database.tips.map((tip) => (tip.id === existingTip.id ? nextTip : tip)) : [...database.tips, nextTip],
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("tips")
      .upsert({ player_id: currentUser.id, game_id: gameId, winner: nextTip.winner, margin: nextTip.margin }, { onConflict: "player_id,game_id" });
    if (error) setAuthError(error.message);
    await refreshSupabaseData(currentUser);
    setSaving(false);
  }

  async function updateGame(gameId, update) {
    if (!isAdmin) return;

    if (!hasSupabase) {
      setDatabase({ ...database, games: database.games.map((game) => (game.id === gameId ? { ...game, ...update } : game)) });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("games").update(update).eq("id", gameId);
    if (error) setAuthError(error.message);
    await refreshSupabaseData(currentUser);
    setSaving(false);
  }

  async function toggleLockAll(lockState) {
    if (!isAdmin) return;
    if (!hasSupabase) {
      setDatabase({ ...database, games: database.games.map((game) => ({ ...game, locked: lockState })) });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("games").update({ locked: lockState }).neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) setAuthError(error.message);
    await refreshSupabaseData(currentUser);
    setSaving(false);
  }

  async function addFixture() {
    if (!isAdmin) return;
    const newGame = { round: 1, kickoff: "TBC", home: "Home Team", away: "Away Team", locked: false, home_score: null, away_score: null };

    if (!hasSupabase) {
      setDatabase({ ...database, games: [...database.games, { id: makeId("game"), ...newGame }] });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("games").insert(newGame);
    if (error) setAuthError(error.message);
    await refreshSupabaseData(currentUser);
    setSaving(false);
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading tipping comp...</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute top-96 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        </div>

        <main className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
              <Trophy className="h-4 w-4" /> NRL Tipping Comp
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Login, tip each round, climb the leaderboard.</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">This version is wired for Supabase auth and database. Without Supabase keys, it runs in preview mode on this device.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <Database className="mb-3 h-6 w-6 text-emerald-300" />
                <div className="font-bold">Real database</div>
                <div className="text-sm text-slate-300">Supabase-ready tables for games, tips and profiles.</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <Shield className="mb-3 h-6 w-6 text-sky-300" />
                <div className="font-bold">Secure auth</div>
                <div className="text-sm text-slate-300">Email/password login through Supabase.</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <WifiOff className="mb-3 h-6 w-6 text-amber-300" />
                <div className="font-bold">Preview fallback</div>
                <div className="text-sm text-slate-300">Still works here without external keys.</div>
              </div>
            </div>
          </motion.section>

          <Card className="border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-5 flex rounded-2xl bg-slate-950/70 p-1">
                <button onClick={() => setAuthMode("login")} className={`flex-1 rounded-xl px-4 py-3 font-semibold ${authMode === "login" ? "bg-emerald-400 text-slate-950" : "text-slate-300"}`}>Login</button>
                <button onClick={() => setAuthMode("register")} className={`flex-1 rounded-xl px-4 py-3 font-semibold ${authMode === "register" ? "bg-emerald-400 text-slate-950" : "text-slate-300"}`}>Register</button>
              </div>

              <form onSubmit={handleAuth} className="grid gap-4">
                {authMode === "register" && (
                  <label className="text-sm font-medium text-slate-300">
                    Name
                    <input value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none" placeholder="Your name" />
                  </label>
                )}
                <label className="text-sm font-medium text-slate-300">
                  Email
                  <input value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none" placeholder="you@email.com" />
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Password
                  <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none" placeholder="Password" />
                </label>
                {authError && <div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}
                <Button type="submit" disabled={saving} className="rounded-2xl bg-emerald-400 py-6 text-base font-bold text-slate-950 hover:bg-emerald-300">
                  {saving ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
                </Button>
              </form>

              {!hasSupabase && <div className="mt-5 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-100">Preview mode: enter any email/password or register a new player. Add Supabase keys to make it live online.</div>}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-96 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200"><Trophy className="h-4 w-4" /> NRL Tipping Comp</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Footy tips, margins and leaderboard</h1>
            <p className="mt-2 max-w-2xl text-slate-300">Logged in as <strong className="text-white">{currentUser.name}</strong> · {isAdmin ? "Admin" : "Player"} · {hasSupabase ? "Supabase live mode" : "Preview mode"}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <Card className="border-white/10 bg-white/10 text-white">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-2xl font-bold">{database.players.length}</div><div className="text-xs text-slate-300">Players</div></div>
                  <div><div className="text-2xl font-bold">{database.games.length}</div><div className="text-xs text-slate-300">Games</div></div>
                  <div><div className="text-2xl font-bold">{completedGames}</div><div className="text-xs text-slate-300">Completed</div></div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={logout} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200"><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          </div>
        </motion.header>

        {authError && <div className="mb-4 rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}

        <div className={`mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <button onClick={() => setActiveTab("tips")} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${activeTab === "tips" ? "bg-emerald-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"}`}><CalendarDays className="h-4 w-4" /> Tips</button>
          <button onClick={() => setActiveTab("leaderboard")} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${activeTab === "leaderboard" ? "bg-emerald-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"}`}><Users className="h-4 w-4" /> Leaderboard</button>
          {isAdmin && <button onClick={() => setActiveTab("admin")} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${activeTab === "admin" ? "bg-emerald-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"}`}><Settings className="h-4 w-4" /> Admin</button>}
        </div>

        {activeTab === "tips" && (
          <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <Card className="border-white/10 bg-white/10 text-white">
              <CardContent className="p-5">
                <h2 className="mb-3 text-lg font-bold">Your tips</h2>
                <p className="text-sm text-slate-300">Pick a winner and margin. Locked games cannot be changed.</p>
                <div className="mt-5 rounded-2xl bg-slate-950/60 p-4"><div className="text-sm text-slate-400">Tips submitted</div><div className="mt-1 text-3xl font-bold">{playerTips.length}/{database.games.length}</div></div>
                <div className="mt-4 rounded-2xl bg-slate-950/60 p-4"><div className="text-sm text-slate-400">Current points</div><div className="mt-1 text-3xl font-bold text-emerald-300">{leaderboard.find((player) => player.id === currentUser.id)?.total || 0}</div></div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {database.games.map((game) => {
                const tip = database.tips.find((item) => item.player_id === currentUser.id && item.game_id === game.id);
                const result = getResult(game);
                const points = scoreTip(tip, result);
                return (
                  <Card key={game.id} className="overflow-hidden border-white/10 bg-white/10 text-white">
                    <CardContent className="p-0">
                      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                            <span className="rounded-full bg-white/10 px-3 py-1">Round {game.round}</span><span>{game.kickoff}</span>
                            {game.locked && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-amber-200"><Lock className="h-3 w-3" /> Locked</span>}
                            {result && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200"><CheckCircle2 className="h-3 w-3" /> {result.winner} by {result.marginPoints}</span>}
                          </div>
                          <h3 className="text-2xl font-bold">{game.home} <span className="text-slate-400">v</span> {game.away}</h3>
                          {result && <p className="mt-1 text-sm text-slate-300">Your score for this game: <strong className="text-white">{points} points</strong></p>}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 md:min-w-[420px]">
                          <div className="rounded-2xl bg-slate-950/50 p-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Winner</div>
                            <div className="grid grid-cols-2 gap-2">
                              {[game.home, game.away].map((team) => <button key={team} disabled={game.locked || saving} onClick={() => updateTip(game.id, { winner: team })} className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tip?.winner === team ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}>{team}</button>)}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-950/50 p-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Margin</div>
                            <div className="grid grid-cols-2 gap-2">
                              {["1-12", "13+"].map((margin) => <button key={margin} disabled={game.locked || saving} onClick={() => updateTip(game.id, { margin })} className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tip?.margin === margin ? "bg-sky-400 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}>{margin}</button>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "leaderboard" && (
          <Card className="border-white/10 bg-white/10 text-white">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Leaderboard</h2><p className="text-sm text-slate-300">Scores update automatically after admin enters results.</p></div><Trophy className="h-10 w-10 text-emerald-300" /></div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-950/70 text-sm uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Player</th><th className="px-4 py-3">Tips submitted</th><th className="px-4 py-3 text-right">Points</th></tr></thead>
                  <tbody>{leaderboard.map((player, index) => <tr key={player.id} className="border-t border-white/10"><td className="px-4 py-4 font-bold">#{index + 1}</td><td className="px-4 py-4">{player.name} {player.role === "admin" && <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">Admin</span>}</td><td className="px-4 py-4 text-slate-300">{player.submitted}/{database.games.length}</td><td className="px-4 py-4 text-right text-xl font-bold text-emerald-300">{player.total}</td></tr>)}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "admin" && isAdmin && (
          <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <Card className="border-white/10 bg-white/10 text-white">
              <CardContent className="p-5">
                <h2 className="text-xl font-bold">Admin controls</h2><p className="mt-2 text-sm text-slate-300">Enter scores, lock games and add fixtures.</p>
                <div className="mt-5 grid gap-2"><Button onClick={addFixture} disabled={saving} className="rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300"><UserPlus className="mr-2 h-4 w-4" /> Add fixture</Button><Button onClick={() => toggleLockAll(true)} disabled={saving} className="rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300">Lock all games</Button><Button onClick={() => toggleLockAll(false)} disabled={saving} className="rounded-2xl bg-sky-400 text-slate-950 hover:bg-sky-300">Unlock all games</Button></div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {database.games.map((game) => {
                const result = getResult(game);
                return (
                  <Card key={game.id} className="border-white/10 bg-white/10 text-white">
                    <CardContent className="grid gap-4 p-5 xl:grid-cols-[1fr_auto] xl:items-center">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="text-sm text-slate-300">Round<input value={game.round} onChange={(event) => updateGame(game.id, { round: Number(event.target.value) || 1 })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none" /></label>
                        <label className="text-sm text-slate-300">Time<input value={game.kickoff} onChange={(event) => updateGame(game.id, { kickoff: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none" /></label>
                        <label className="text-sm text-slate-300">Home<input value={game.home} onChange={(event) => updateGame(game.id, { home: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none" /></label>
                        <label className="text-sm text-slate-300">Away<input value={game.away} onChange={(event) => updateGame(game.id, { away: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none" /></label>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[90px_90px_auto] sm:items-end">
                        <label className="text-sm text-slate-300">Home score<input value={game.home_score ?? ""} onChange={(event) => updateGame(game.id, { home_score: event.target.value === "" ? null : Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none" inputMode="numeric" /></label>
                        <label className="text-sm text-slate-300">Away score<input value={game.away_score ?? ""} onChange={(event) => updateGame(game.id, { away_score: event.target.value === "" ? null : Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none" inputMode="numeric" /></label>
                        <button onClick={() => updateGame(game.id, { locked: !game.locked })} disabled={saving} className={`rounded-xl px-4 py-2 font-semibold disabled:opacity-60 ${game.locked ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}>{game.locked ? "Locked" : "Unlocked"}</button>
                      </div>
                      <div className="xl:col-span-2 text-sm text-slate-300">{result ? `${game.home} ${game.home_score} - ${game.away_score} ${game.away}. ${result.winner} wins by ${result.marginPoints} (${result.margin}).` : `${game.home} v ${game.away}. No result entered yet.`}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}