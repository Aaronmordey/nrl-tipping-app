import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Users, Lock, CalendarDays, Settings, CheckCircle2, LogOut, UserPlus, Database, Shield, Download, RefreshCw, Medal, Clock, ClipboardList, Trash2, UserCog } from "lucide-react";
import { motion } from "framer-motion";

function Button({ className = "", children, ...props }) {
  return <button className={`inline-flex items-center justify-center px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>{children}</button>;
}
function Card({ className = "", children }) { return <div className={className}>{children}</div>; }
function CardContent({ className = "", children }) { return <div className={className}>{children}</div>; }

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const sportsDbKey = import.meta.env?.VITE_THESPORTSDB_API_KEY || "3";
const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;
const NRL_LEAGUE_ID = "4416";
const STORAGE_KEY = "nrl-tipping-comp-preview-v3";

const teamLogoMap = {
  "Broncos":"https://www.thesportsdb.com/images/media/team/badge/psuwsp1429610811.png", "Brisbane Broncos":"https://www.thesportsdb.com/images/media/team/badge/psuwsp1429610811.png",
  "Storm":"https://www.thesportsdb.com/images/media/team/badge/rqwvus1429610896.png", "Melbourne Storm":"https://www.thesportsdb.com/images/media/team/badge/rqwvus1429610896.png",
  "Panthers":"https://www.thesportsdb.com/images/media/team/badge/uvpyru1429610881.png", "Penrith Panthers":"https://www.thesportsdb.com/images/media/team/badge/uvpyru1429610881.png",
  "Eels":"https://www.thesportsdb.com/images/media/team/badge/rxtqtr1429610859.png", "Parramatta Eels":"https://www.thesportsdb.com/images/media/team/badge/rxtqtr1429610859.png",
  "Warriors":"https://www.thesportsdb.com/images/media/team/badge/okm1423062521.png", "New Zealand Warriors":"https://www.thesportsdb.com/images/media/team/badge/okm1423062521.png",
  "Dragons":"https://www.thesportsdb.com/images/media/team/badge/wqwsut1429610836.png", "St George Illawarra Dragons":"https://www.thesportsdb.com/images/media/team/badge/wqwsut1429610836.png", "St. George Illawarra Dragons":"https://www.thesportsdb.com/images/media/team/badge/wqwsut1429610836.png",
  "Cowboys":"https://www.thesportsdb.com/images/media/team/badge/uwwrrq1429610915.png", "North Queensland Cowboys":"https://www.thesportsdb.com/images/media/team/badge/uwwrrq1429610915.png",
  "Raiders":"https://www.thesportsdb.com/images/media/team/badge/vyxxuw1429610850.png", "Canberra Raiders":"https://www.thesportsdb.com/images/media/team/badge/vyxxuw1429610850.png",
  "Rabbitohs":"https://www.thesportsdb.com/images/media/team/badge/vswrtt1429610876.png", "South Sydney Rabbitohs":"https://www.thesportsdb.com/images/media/team/badge/vswrtt1429610876.png",
  "Roosters":"https://www.thesportsdb.com/images/media/team/badge/vywvut1429610830.png", "Sydney Roosters":"https://www.thesportsdb.com/images/media/team/badge/vywvut1429610830.png",
  "Sharks":"https://www.thesportsdb.com/images/media/team/badge/rrxpsr1429610864.png", "Cronulla Sharks":"https://www.thesportsdb.com/images/media/team/badge/rrxpsr1429610864.png", "Cronulla-Sutherland Sharks":"https://www.thesportsdb.com/images/media/team/badge/rrxpsr1429610864.png",
  "Bulldogs":"https://www.thesportsdb.com/images/media/team/badge/vsswut1429610904.png", "Canterbury Bulldogs":"https://www.thesportsdb.com/images/media/team/badge/vsswut1429610904.png", "Canterbury-Bankstown Bulldogs":"https://www.thesportsdb.com/images/media/team/badge/vsswut1429610904.png",
  "Sea Eagles":"https://www.thesportsdb.com/images/media/team/badge/wutwxs1429610909.png", "Manly Sea Eagles":"https://www.thesportsdb.com/images/media/team/badge/wutwxs1429610909.png", "Manly-Warringah Sea Eagles":"https://www.thesportsdb.com/images/media/team/badge/wutwxs1429610909.png",
  "Knights":"https://www.thesportsdb.com/images/media/team/badge/yxxpux1429610887.png", "Newcastle Knights":"https://www.thesportsdb.com/images/media/team/badge/yxxpux1429610887.png",
  "Titans":"https://www.thesportsdb.com/images/media/team/badge/wvrwtx1429610821.png", "Gold Coast Titans":"https://www.thesportsdb.com/images/media/team/badge/wvrwtx1429610821.png",
  "Tigers":"https://www.thesportsdb.com/images/media/team/badge/tqpvrw1429610892.png", "Wests Tigers":"https://www.thesportsdb.com/images/media/team/badge/tqpvrw1429610892.png"
};

const previewDatabase = {
  currentUser: null,
  players: [{id:"admin",name:"Aaron",email:"admin@nrltips.com",role:"admin"},{id:"p2",name:"Ivy",email:"ivy@test.com",role:"player"},{id:"p3",name:"Mick",email:"mick@test.com",role:"player"}],
  games: [
    {id:"g1",round:1,season:"2026",kickoff:"Thu 7:50pm",kickoff_at:new Date(Date.now()+86400000).toISOString(),home:"Broncos",away:"Storm",locked:false,home_score:null,away_score:null,status:"scheduled"},
    {id:"g2",round:1,season:"2026",kickoff:"Fri 6:00pm",kickoff_at:new Date(Date.now()+172800000).toISOString(),home:"Warriors",away:"Dragons",locked:false,home_score:null,away_score:null,status:"scheduled"},
    {id:"g3",round:1,season:"2026",kickoff:"Fri 8:00pm",kickoff_at:new Date(Date.now()+180000000).toISOString(),home:"Panthers",away:"Eels",locked:false,home_score:null,away_score:null,status:"scheduled"}
  ],
  tips: [{id:"t1",player_id:"p2",game_id:"g1",winner:"Storm",margin:"1-12"},{id:"t2",player_id:"p3",game_id:"g1",winner:"Broncos",margin:"1-12"}]
};

function loadPreviewDatabase(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||previewDatabase}catch{return previewDatabase}}
function savePreviewDatabase(db){localStorage.setItem(STORAGE_KEY,JSON.stringify(db))}
function makeId(prefix){return `${prefix}_${Math.random().toString(36).slice(2,9)}`}
function getLogo(team,fallback){return (fallback&&String(fallback).startsWith("http"))?fallback:(teamLogoMap[team]||"")}
function teamInitials(team){return String(team||"").split(/\s+/).map(w=>w[0]).join("").slice(0,3).toUpperCase()}
function parseSportsDate(event){const d=event.dateEvent||event.dateEventLocal; const t=(event.strTime||event.strTimeLocal||"00:00:00").split("+")[0]; return d ? new Date(`${d}T${t.endsWith("Z")?t:t+"Z"}`).toISOString() : null}
function getPrettyKickoff(game){ if(!game.kickoff_at) return game.kickoff||"TBC"; try{return new Intl.DateTimeFormat("en-AU",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit",timeZone:"Australia/Brisbane"}).format(new Date(game.kickoff_at))}catch{return game.kickoff||"TBC"}}
function getResult(game){ if(game.home_score===null||game.home_score===""||game.away_score===null||game.away_score==="") return null; const h=Number(game.home_score), a=Number(game.away_score); if(Number.isNaN(h)||Number.isNaN(a)||h===a) return null; const winner=h>a?game.home:game.away; const marginPoints=Math.abs(h-a); return {winner,margin:marginPoints<=12?"1-12":"13+",marginPoints}}
function scoreTip(tip,result){ if(!tip||!result) return 0; if(tip.winner!==result.winner) return 0; return tip.margin===result.margin?5:2 }
function roundLockStarted(games,round){ const times=games.filter(g=>Number(g.round)===Number(round)).map(g=>g.kickoff_at?new Date(g.kickoff_at).getTime():null).filter(Boolean); return times.length?Date.now()>=Math.min(...times):false }
function isGameLocked(game,games){ return game.locked || roundLockStarted(games,game.round) }
function normalizeSportsEvent(event,season){ const home=event.strHomeTeam||event.strHome||"Home Team"; const away=event.strAwayTeam||event.strAway||"Away Team"; const hs=event.intHomeScore===null||event.intHomeScore===undefined||event.intHomeScore===""?null:Number(event.intHomeScore); const as=event.intAwayScore===null||event.intAwayScore===undefined||event.intAwayScore===""?null:Number(event.intAwayScore); const kickoff_at=parseSportsDate(event); return {external_id:String(event.idEvent),season:String(season||event.strSeason||new Date().getFullYear()),round:Number(event.intRound||event.intRoundNumber||1),kickoff:kickoff_at?getPrettyKickoff({kickoff_at}):(event.dateEvent||"TBC"),kickoff_at,home,away,venue:event.strVenue||null,home_logo:getLogo(home,event.strHomeTeamBadge),away_logo:getLogo(away,event.strAwayTeamBadge),locked:false,home_score:hs,away_score:as,status:hs!==null&&as!==null?"completed":"scheduled"}}
function scoreRows(players,games,tips,round=null){ const scoped=round?games.filter(g=>Number(g.round)===Number(round)):games; return players.map(p=>{ const total=scoped.reduce((sum,g)=>sum+scoreTip(tips.find(t=>t.player_id===p.id&&t.game_id===g.id),getResult(g)),0); const submitted=scoped.filter(g=>tips.find(t=>t.player_id===p.id&&t.game_id===g.id)).length; const correctWinners=scoped.filter(g=>{const tip=tips.find(t=>t.player_id===p.id&&t.game_id===g.id), r=getResult(g); return tip&&r&&tip.winner===r.winner}).length; const correctMargins=scoped.filter(g=>{const tip=tips.find(t=>t.player_id===p.id&&t.game_id===g.id), r=getResult(g); return tip&&r&&tip.winner===r.winner&&tip.margin===r.margin}).length; return {...p,total,submitted,correctWinners,correctMargins}}).sort((a,b)=>b.total-a.total||b.correctWinners-a.correctWinners||b.submitted-a.submitted||a.name.localeCompare(b.name)) }

export default function App(){
  const [database,setDatabase]=useState(previewDatabase); const [activeTab,setActiveTab]=useState("tips"); const [authMode,setAuthMode]=useState("login"); const [authForm,setAuthForm]=useState({name:"",email:"",password:"",newPassword:""}); const [authError,setAuthError]=useState(""); const [notice,setNotice]=useState(""); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [saveSuccess,setSaveSuccess]=useState(false); const [draftTips,setDraftTips]=useState([]); const [resetSessionReady,setResetSessionReady]=useState(false); const [selectedRound,setSelectedRound]=useState(1); const [importSeason,setImportSeason]=useState(String(new Date().getFullYear())); const [importRound,setImportRound]=useState("1");
  const currentUser=database.currentUser; const isAdmin=currentUser?.role==="admin";
  const rounds=useMemo(()=>{const list=[...new Set(database.games.map(g=>Number(g.round)).filter(Boolean))].sort((a,b)=>a-b); return list.length?list:[1]},[database.games]);
  const visibleGames=database.games.filter(g=>Number(g.round)===Number(selectedRound)).sort((a,b)=>new Date(a.kickoff_at||0)-new Date(b.kickoff_at||0));
  const playerTips=database.tips.filter(t=>t.player_id===currentUser?.id); const leaderboard=useMemo(()=>scoreRows(database.players,database.games,database.tips),[database]); const weeklyLeaderboard=useMemo(()=>scoreRows(database.players,database.games,database.tips,selectedRound),[database,selectedRound]); const roundSummaries=useMemo(()=>rounds.map(round=>{const rows=scoreRows(database.players,database.games,database.tips,round); const games=database.games.filter(g=>Number(g.round)===Number(round)); const completed=games.filter(g=>getResult(g)).length; return {round, winner:rows[0], games:games.length, completed, rows};}),[rounds,database]); const roundWinner=weeklyLeaderboard[0]; const completedGames=database.games.filter(g=>getResult(g)).length; const roundLocked=roundLockStarted(database.games,selectedRound);

  async function refreshSupabaseData(userProfile=currentUser){ if(!supabase||!userProfile)return; setLoading(true); const [{data:profiles,error:pe},{data:games,error:ge},{data:tips,error:te}]=await Promise.all([supabase.from("profiles").select("id,name,email,role").order("name"),supabase.from("games").select("*").order("round").order("kickoff_at",{nullsFirst:false}),supabase.from("tips").select("id,player_id,game_id,winner,margin,updated_at")]); if(pe||ge||te){setAuthError(pe?.message||ge?.message||te?.message||"Could not load database."); setLoading(false); return} const fresh=profiles.find(p=>p.id===userProfile.id)||userProfile; setDatabase({currentUser:fresh,players:profiles||[],games:games||[],tips:tips||[]}); setLoading(false) }
  useEffect(()=>{async function boot(){
    if(!hasSupabase){const local=loadPreviewDatabase(); setDatabase(local); setSelectedRound(Number(local.games?.[0]?.round||1)); setLoading(false); return}
    const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
    const type=hash.get("type");
    const access_token=hash.get("access_token");
    const refresh_token=hash.get("refresh_token");
    if(type==="recovery"&&access_token&&refresh_token){
      const {error}=await supabase.auth.setSession({access_token,refresh_token});
      if(error){setAuthError(error.message); setAuthMode("login");}
      else{setAuthMode("resetPassword"); setResetSessionReady(true);}
      window.history.replaceState({},document.title,window.location.pathname);
      setLoading(false);
      return;
    }
    const {data}=await supabase.auth.getSession(); const user=data?.session?.user; if(!user){setLoading(false);return}
    const {data:profile}=await supabase.from("profiles").select("id,name,email,role").eq("id",user.id).single(); if(profile) await refreshSupabaseData(profile); setLoading(false)
  } boot()},[]);
  useEffect(()=>{ if(!hasSupabase) savePreviewDatabase(database)},[database]);
  useEffect(()=>{ if(!rounds.includes(Number(selectedRound))&&rounds[0]) setSelectedRound(rounds[0])},[rounds,selectedRound]);
  useEffect(()=>{ if(currentUser) setDraftTips(database.tips.filter(t=>t.player_id===currentUser.id)); else setDraftTips([]) },[currentUser?.id,database.tips]);

  async function handleAuth(e){ e.preventDefault(); setAuthError(""); const email=authForm.email.trim().toLowerCase(), password=authForm.password.trim(), name=authForm.name.trim(); if(!email||!password||(authMode==="register"&&!name)){setAuthError("Please fill in the required fields."); return} if(!hasSupabase){ if(authMode==="register"){const newPlayer={id:makeId("player"),name,email,role:"player"}; setDatabase({...database,currentUser:newPlayer,players:[...database.players,newPlayer]}); return} setDatabase({...database,currentUser:database.players.find(p=>p.email.toLowerCase()===email)||database.players[0]}); return} setSaving(true); if(authMode==="register"){ const {data,error}=await supabase.auth.signUp({email,password}); if(error){setSaving(false);return setAuthError(error.message)} const profile={id:data.user.id,name,email,role:"player"}; const {error:profileError}=await supabase.from("profiles").insert(profile); if(profileError){setSaving(false);return setAuthError(profileError.message)} await refreshSupabaseData(profile); setSaving(false); return} const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error){setSaving(false);return setAuthError(error.message)} const {data:profile,error:profileError}=await supabase.from("profiles").select("id,name,email,role").eq("id",data.user.id).single(); if(profileError){setSaving(false);return setAuthError(profileError.message)} await refreshSupabaseData(profile); setSaving(false)}
  async function logout(){ if(hasSupabase) await supabase.auth.signOut(); setDatabase({...database,currentUser:null}); setActiveTab("tips") }

  async function sendPasswordReset(){
    setAuthError(""); setNotice("");
    const email=authForm.email.trim().toLowerCase();
    if(!email){setAuthError("Enter your email address first."); return}
    if(!hasSupabase){setNotice("Password reset only works in the live Supabase app."); return}
    setSaving(true);
    const redirectTo=window.location.origin;
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});
    if(error) setAuthError(error.message);
    else setNotice("Password reset email sent. Check your inbox and spam folder.");
    setSaving(false);
  }

  async function updatePassword(e){
    e.preventDefault();
    setAuthError(""); setNotice("");
    const password=authForm.newPassword.trim();
    if(password.length<6){setAuthError("Password must be at least 6 characters."); return}
    if(!hasSupabase||!resetSessionReady){setAuthError("Reset session is not ready. Open the latest reset link from your email."); return}
    setSaving(true);
    const {error}=await supabase.auth.updateUser({password});
    if(error){setAuthError(error.message); setSaving(false); return}
    await supabase.auth.signOut();
    setDatabase({...database,currentUser:null});
    setAuthMode("login");
    setResetSessionReady(false);
    setAuthForm({name:"",email:"",password:"",newPassword:""});
    setNotice("Password updated. You can now log in with your new password.");
    setSaving(false);
  }
  function updateTip(gameId,update){
    setSaveSuccess(false);
    if(!currentUser)return;
    const game=database.games.find(g=>g.id===gameId);
    if(isGameLocked(game,database.games))return;
    const existing=draftTips.find(t=>t.player_id===currentUser.id&&t.game_id===gameId);
    const next={id:existing?.id||makeId("tip"),player_id:currentUser.id,game_id:gameId,winner:existing?.winner||game.home,margin:existing?.margin||"1-12",...update};
    setDraftTips(existing?draftTips.map(t=>t.id===existing.id?next:t):[...draftTips,next]);
  }

  async function saveAllTips(){
    if(!currentUser)return;
    setAuthError("");
    setNotice("");
    const unlockedGames=visibleGames.filter(game=>!isGameLocked(game,database.games));
    const tipsToSave=unlockedGames.map(game=>draftTips.find(t=>t.player_id===currentUser.id&&t.game_id===game.id)).filter(Boolean);
    if(!tipsToSave.length){setNotice("No tips selected to save."); return}
    setSaving(true);
    if(!hasSupabase){
      const otherTips=database.tips.filter(t=>!(t.player_id===currentUser.id&&unlockedGames.some(g=>g.id===t.game_id)));
      setDatabase({...database,tips:[...otherTips,...tipsToSave]});
      setNotice(`Saved ${tipsToSave.length} tips.`);
      setSaveSuccess(true);
      setSaving(false);
      return;
    }
    const rows=tipsToSave.map(t=>({player_id:currentUser.id,game_id:t.game_id,winner:t.winner,margin:t.margin}));
    const {error}=await supabase.from("tips").upsert(rows,{onConflict:"player_id,game_id"});
    if(error){setAuthError(error.message); setSaving(false); return}
    const otherTips=database.tips.filter(t=>!(t.player_id===currentUser.id&&unlockedGames.some(g=>g.id===t.game_id)));
    setDatabase({...database,tips:[...otherTips,...tipsToSave]});
    setNotice(`Saved ${tipsToSave.length} tips.`);
    setSaveSuccess(true);
    setSaving(false);
  }
  async function updateGame(gameId,update){ if(!isAdmin)return; if(!hasSupabase){setDatabase({...database,games:database.games.map(g=>g.id===gameId?{...g,...update}:g)});return} setSaving(true); const {error}=await supabase.from("games").update(update).eq("id",gameId); if(error)setAuthError(error.message); await refreshSupabaseData(currentUser); setSaving(false)}
  async function toggleLockRound(round,lockState){ if(!isAdmin)return; const ids=database.games.filter(g=>Number(g.round)===Number(round)).map(g=>g.id); if(!hasSupabase){setDatabase({...database,games:database.games.map(g=>Number(g.round)===Number(round)?{...g,locked:lockState}:g)});return} setSaving(true); const {error}=await supabase.from("games").update({locked:lockState}).in("id",ids); if(error)setAuthError(error.message); await refreshSupabaseData(currentUser); setSaving(false)}
  async function addFixture(){ if(!isAdmin)return; const newGame={round:Number(selectedRound||1),season:importSeason,kickoff:"TBC",kickoff_at:null,home:"Home Team",away:"Away Team",locked:false,home_score:null,away_score:null,status:"scheduled",home_logo:"",away_logo:""}; if(!hasSupabase){setDatabase({...database,games:[...database.games,{id:makeId("game"),...newGame}]});return} setSaving(true); const {error}=await supabase.from("games").insert(newGame); if(error)setAuthError(error.message); await refreshSupabaseData(currentUser); setSaving(false)}

  async function deleteFixture(game){
    if(!isAdmin||!game)return;
    const ok=window.confirm(`Delete fixture: ${game.home} v ${game.away}? This will also remove tips for this fixture.`);
    if(!ok)return;
    setSaving(true); setAuthError(""); setNotice("");
    if(!hasSupabase){
      setDatabase({...database,games:database.games.filter(g=>g.id!==game.id),tips:database.tips.filter(t=>t.game_id!==game.id)});
      setNotice("Fixture deleted.");
      setSaving(false);
      return;
    }
    const {error:tipError}=await supabase.from("tips").delete().eq("game_id",game.id);
    if(tipError){setAuthError(tipError.message); setSaving(false); return}
    const {error}=await supabase.from("games").delete().eq("id",game.id);
    if(error)setAuthError(error.message);
    else setNotice("Fixture deleted.");
    await refreshSupabaseData(currentUser);
    setSaving(false);
  }

  async function clearSelectedRound(round){
    if(!isAdmin)return;
    const roundGames=database.games.filter(g=>Number(g.round)===Number(round));
    if(!roundGames.length){setNotice("There are no fixtures to clear for this round."); return}
    const ok=window.confirm(`Clear all ${roundGames.length} fixtures from Round ${round}? This will also remove tips for those fixtures.`);
    if(!ok)return;
    setSaving(true); setAuthError(""); setNotice("");
    const ids=roundGames.map(g=>g.id);
    if(!hasSupabase){
      setDatabase({...database,games:database.games.filter(g=>!ids.includes(g.id)),tips:database.tips.filter(t=>!ids.includes(t.game_id))});
      setNotice(`Round ${round} cleared.`);
      setSaving(false);
      return;
    }
    const {error:tipError}=await supabase.from("tips").delete().in("game_id",ids);
    if(tipError){setAuthError(tipError.message); setSaving(false); return}
    const {error}=await supabase.from("games").delete().in("id",ids);
    if(error)setAuthError(error.message);
    else setNotice(`Round ${round} cleared.`);
    await refreshSupabaseData(currentUser);
    setSaving(false);
  }
  async function importFixtures(){ if(!isAdmin)return; setSaving(true); setAuthError(""); setNotice(""); try{ const response=await fetch(`https://www.thesportsdb.com/api/v2/json/schedule/league/${NRL_LEAGUE_ID}/${importSeason}`,{headers:{"X-API-KEY":sportsDbKey}}); const json=await response.json(); const events=json.schedule||json.events||json.event||[]; const roundEvents=events.filter(ev=>String(ev.intRound||ev.intRoundNumber||"")===String(importRound)); if(!roundEvents.length){setNotice(`No fixtures found for season ${importSeason}, round ${importRound}. You can add them manually.`); setSaving(false); return} const rows=roundEvents.map(ev=>normalizeSportsEvent(ev,importSeason)); if(!hasSupabase){let merged=[...database.games]; rows.forEach(row=>{const i=merged.findIndex(g=>g.external_id===row.external_id); if(i>=0)merged[i]={...merged[i],...row}; else merged.push({id:makeId("game"),...row})}); setDatabase({...database,games:merged}); setSelectedRound(Number(importRound)); setNotice(`Imported ${rows.length} fixtures.`); setSaving(false); return} const {error}=await supabase.from("games").upsert(rows,{onConflict:"external_id"}); if(error)throw error; await refreshSupabaseData(currentUser); setSelectedRound(Number(importRound)); setNotice(`Imported ${rows.length} fixtures for Round ${importRound}.`) }catch(error){setAuthError(error.message||"Could not import fixtures.")} setSaving(false)}
  async function syncResults(){ if(!isAdmin)return; setSaving(true); setAuthError(""); setNotice(""); try{ const response=await fetch(`https://www.thesportsdb.com/api/v2/json/schedule/league/${NRL_LEAGUE_ID}/${importSeason}`,{headers:{"X-API-KEY":sportsDbKey}}); const json=await response.json(); const events=json.schedule||json.events||json.event||[]; const ids=database.games.map(g=>g.external_id).filter(Boolean); const resultRows=events.filter(ev=>ids.includes(String(ev.idEvent))).map(ev=>normalizeSportsEvent(ev,importSeason)).filter(row=>row.home_score!==null&&row.away_score!==null); if(!resultRows.length){setNotice("No completed results found yet."); setSaving(false); return} if(!hasSupabase){setDatabase({...database,games:database.games.map(g=>{const r=resultRows.find(row=>row.external_id===g.external_id); return r?{...g,...r,locked:true}:g})}); setNotice(`Synced ${resultRows.length} results.`); setSaving(false); return} for(const row of resultRows){await supabase.from("games").update({home_score:row.home_score,away_score:row.away_score,status:"completed",locked:true}).eq("external_id",row.external_id)} await refreshSupabaseData(currentUser); setNotice(`Synced ${resultRows.length} completed results.`)}catch(error){setAuthError(error.message||"Could not sync results.")} setSaving(false)}

  if(loading)return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading tipping comp...</div>;
  if(!currentUser)return <LoginScreen authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} authError={authError} notice={notice} handleAuth={handleAuth} sendPasswordReset={sendPasswordReset} updatePassword={updatePassword} saving={saving}/>;

  return <div className="min-h-screen bg-slate-950 text-white"><div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"/><div className="absolute top-96 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"/></div><main className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
    <Header currentUser={currentUser} isAdmin={isAdmin} database={database} completedGames={completedGames} selectedRound={selectedRound} roundLocked={roundLocked} logout={logout}/>
    {authError&&<div className="mb-4 rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="mb-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
    <RoundSelector rounds={rounds} selectedRound={selectedRound} setSelectedRound={setSelectedRound} roundLocked={roundLocked}/>
    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin}/>
    {activeTab==="tips"&&<TipsPanel visibleGames={visibleGames} database={database} currentUser={currentUser} playerTips={playerTips} draftTips={draftTips} leaderboard={leaderboard} updateTip={updateTip} saveAllTips={saveAllTips} saveSuccess={saveSuccess} saving={saving}/>} 
    {(activeTab==="leaderboard"||activeTab==="weekly")&&<LeaderboardPanel mode={activeTab} selectedRound={selectedRound} leaderboard={leaderboard} weeklyLeaderboard={weeklyLeaderboard} roundWinner={roundWinner}/>} {activeTab==="history"&&<HistoryPanel roundSummaries={roundSummaries} setSelectedRound={setSelectedRound} setActiveTab={setActiveTab}/>} 
    {activeTab==="adminTips"&&isAdmin&&<TipCheckPanel database={database} visibleGames={visibleGames} selectedRound={selectedRound}/>} 
    {activeTab==="adminPlayers"&&isAdmin&&<PlayerManagementPanel database={database} leaderboard={leaderboard} updatePlayerRole={updatePlayerRole} saving={saving}/>} 
    {activeTab==="admin"&&isAdmin&&<AdminPanel visibleGames={visibleGames} database={database} selectedRound={selectedRound} importSeason={importSeason} setImportSeason={setImportSeason} importRound={importRound} setImportRound={setImportRound} importFixtures={importFixtures} syncResults={syncResults} addFixture={addFixture} toggleLockRound={toggleLockRound} updateGame={updateGame} deleteFixture={deleteFixture} clearSelectedRound={clearSelectedRound} saving={saving}/>} 
  </main></div>;
}

function LoginScreen({authMode,setAuthMode,authForm,setAuthForm,authError,notice,handleAuth,sendPasswordReset,updatePassword,saving}){return <div className="min-h-screen bg-slate-950 px-4 py-8 text-white"><div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"/><div className="absolute top-96 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"/></div><main className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px] lg:items-center"><motion.section initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200"><Trophy className="h-4 w-4"/> NRL Tipping Comp</div><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Login, tip each round, climb the leaderboard.</h1><p className="mt-4 max-w-2xl text-lg text-slate-300">Live NRL tipping comp with weekly fixtures, round lockout, results, team logos, and leaderboards.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Info icon={<Database/>} title="Real database" text="Supabase stores games, tips and profiles."/><Info icon={<Shield/>} title="Secure auth" text="Email/password login through Supabase."/><Info icon={<Clock/>} title="Round lockout" text="Whole round locks at first kickoff."/></div></motion.section><Card className="border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur"><CardContent className="p-6">
{authMode!=="forgotPassword"&&authMode!=="resetPassword"&&<div className="mb-5 flex rounded-2xl bg-slate-950/70 p-1"><button onClick={()=>setAuthMode("login")} className={`flex-1 rounded-xl px-4 py-3 font-semibold ${authMode==="login"?"bg-emerald-400 text-slate-950":"text-slate-300"}`}>Login</button><button onClick={()=>setAuthMode("register")} className={`flex-1 rounded-xl px-4 py-3 font-semibold ${authMode==="register"?"bg-emerald-400 text-slate-950":"text-slate-300"}`}>Register</button></div>}

{authMode==="resetPassword"?<form onSubmit={updatePassword} className="grid gap-4"><h2 className="text-2xl font-bold">Set a new password</h2><p className="text-sm text-slate-300">Enter your new password below.</p><Input label="New password" type="password" value={authForm.newPassword} onChange={v=>setAuthForm({...authForm,newPassword:v})} placeholder="New password"/>{authError&&<div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}<Button type="submit" disabled={saving} className="rounded-2xl bg-emerald-400 py-6 text-base font-bold text-slate-950 hover:bg-emerald-300">{saving?"Saving...":"Update password"}</Button></form>:authMode==="forgotPassword"?<div className="grid gap-4"><h2 className="text-2xl font-bold">Reset password</h2><p className="text-sm text-slate-300">Enter your email and Supabase will send you a password reset link.</p><Input label="Email" value={authForm.email} onChange={v=>setAuthForm({...authForm,email:v})} placeholder="you@email.com"/>{authError&&<div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}<Button onClick={sendPasswordReset} disabled={saving} className="rounded-2xl bg-emerald-400 py-6 text-base font-bold text-slate-950 hover:bg-emerald-300">{saving?"Sending...":"Send reset email"}</Button><button onClick={()=>setAuthMode("login")} className="text-sm font-semibold text-slate-300 hover:text-white">Back to login</button></div>:<form onSubmit={handleAuth} className="grid gap-4">{authMode==="register"&&<Input label="Name" value={authForm.name} onChange={v=>setAuthForm({...authForm,name:v})} placeholder="Your name"/>}<Input label="Email" value={authForm.email} onChange={v=>setAuthForm({...authForm,email:v})} placeholder="you@email.com"/><Input label="Password" type="password" value={authForm.password} onChange={v=>setAuthForm({...authForm,password:v})} placeholder="Password"/>{authError&&<div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}<Button type="submit" disabled={saving} className="rounded-2xl bg-emerald-400 py-6 text-base font-bold text-slate-950 hover:bg-emerald-300">{saving?"Please wait...":authMode==="login"?"Login":"Create account"}</Button>{authMode==="login"&&<button type="button" onClick={()=>setAuthMode("forgotPassword")} className="text-sm font-semibold text-slate-300 hover:text-white">Forgot password?</button>}</form>}
</CardContent></Card></main></div>}
function Info({icon,title,text}){return <div className="rounded-2xl bg-white/10 p-4">{React.cloneElement(icon,{className:"mb-3 h-6 w-6 text-emerald-300"})}<div className="font-bold">{title}</div><div className="text-sm text-slate-300">{text}</div></div>}
function Input({label,value,onChange,placeholder,type="text"}){return <label className="text-sm font-medium text-slate-300">{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none" placeholder={placeholder}/></label>}
function Header({currentUser,isAdmin,database,completedGames,selectedRound,roundLocked,logout}){return <motion.header initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200"><Trophy className="h-4 w-4"/> NRL Tipping Comp</div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Footy tips, margins and leaderboard</h1><p className="mt-2 max-w-2xl text-slate-300">Logged in as <strong className="text-white">{currentUser.name}</strong> · {isAdmin?"Admin":"Player"} · Round {selectedRound} {roundLocked?"is locked":"is open"}</p></div><div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"><Card className="border-white/10 bg-white/10 text-white"><CardContent className="p-4"><div className="grid grid-cols-3 gap-4 text-center"><Stat n={database.players.length} t="Players"/><Stat n={database.games.length} t="Games"/><Stat n={completedGames} t="Done"/></div></CardContent></Card><Button onClick={logout} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200"><LogOut className="mr-2 h-4 w-4"/> Logout</Button></div></motion.header>}
function Stat({n,t}){return <div><div className="text-2xl font-bold">{n}</div><div className="text-xs text-slate-300">{t}</div></div>}
function RoundSelector({rounds,selectedRound,setSelectedRound,roundLocked}){return <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2">{rounds.map(r=><button key={r} onClick={()=>setSelectedRound(r)} className={`rounded-2xl px-4 py-2 font-bold ${Number(selectedRound)===Number(r)?"bg-emerald-400 text-slate-950":"bg-white/10 text-slate-200 hover:bg-white/20"}`}>Round {r}</button>)}</div><div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold ${roundLocked?"bg-amber-400/20 text-amber-100":"bg-emerald-400/20 text-emerald-100"}`}><Clock className="h-4 w-4"/> {roundLocked?"Whole round locked":"Tips open until first game starts"}</div></div>}
function Tabs({activeTab,setActiveTab,isAdmin}){const tabs=[["tips","Tips",CalendarDays],["leaderboard","Overall",Users],["weekly","Weekly",Medal],["history","History",Trophy],...(isAdmin?[["adminTips","Tip Check",ClipboardList],["adminPlayers","Players",UserCog],["admin","Admin",Settings]]:[])];return <div className={`mb-6 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur sm:gap-3 sm:p-3 ${isAdmin?"sm:grid-cols-7":"sm:grid-cols-4"}`}>{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setActiveTab(id)} className={`flex items-center justify-center gap-1 rounded-2xl px-3 py-3 text-sm font-semibold transition sm:gap-2 sm:px-4 sm:text-base ${activeTab===id?"bg-emerald-400 text-slate-950":"bg-white/5 text-slate-200 hover:bg-white/10"}`}><Icon className="h-4 w-4"/> {label}</button>)}</div>}
function TipsPanel({visibleGames,database,currentUser,playerTips,draftTips,leaderboard,updateTip,saveAllTips,saveSuccess,saving}){const submittedCount=visibleGames.filter(g=>playerTips.some(t=>t.game_id===g.id)).length; const draftCount=visibleGames.filter(g=>draftTips.some(t=>t.game_id===g.id)).length; const remaining=Math.max(visibleGames.length-draftCount,0); return <section className="grid gap-5 lg:grid-cols-[280px_1fr]"><Card className="border-white/10 bg-white/10 text-white rounded-3xl"><CardContent className="p-5"><h2 className="mb-3 text-lg font-bold">Your tips</h2><p className="text-sm text-slate-300">Pick every game, then press Save Tips at the bottom.</p><div className="mt-5 rounded-2xl bg-slate-950/60 p-4"><div className="text-sm text-slate-400">Saved tips</div><div className="mt-1 text-3xl font-bold">{submittedCount}/{visibleGames.length}</div></div><div className="mt-4 rounded-2xl bg-slate-950/60 p-4"><div className="text-sm text-slate-400">Tips remaining</div><div className="mt-1 text-3xl font-bold text-amber-300">{remaining}</div></div><div className="mt-4 rounded-2xl bg-slate-950/60 p-4"><div className="text-sm text-slate-400">Current points</div><div className="mt-1 text-3xl font-bold text-emerald-300">{leaderboard.find(p=>p.id===currentUser.id)?.total||0}</div></div></CardContent></Card><div className="grid gap-4">{saveSuccess&&<Card className="rounded-3xl border border-emerald-400/40 bg-emerald-400/15 text-white"><CardContent className="p-5 text-center"><div className="text-3xl font-black text-emerald-300">✓ Tips saved!</div><p className="mt-2 text-sm text-emerald-100">Your tips for this round have been saved successfully.</p></CardContent></Card>}{visibleGames.map(game=><GameTip key={game.id} game={game} database={database} currentUser={currentUser} draftTips={draftTips} updateTip={updateTip} saving={saving}/>) }<Card className={`sticky bottom-3 z-20 rounded-3xl border text-white shadow-2xl backdrop-blur ${saveSuccess?"border-emerald-400/60 bg-emerald-950/95":"border-emerald-400/30 bg-slate-900/95"}`}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-bold">{saveSuccess?"Saved successfully":"Ready to save?"}</div><div className="text-sm text-slate-300">{saveSuccess?"You can still change tips and save again before lockout.":`${draftCount}/${visibleGames.length} tips selected for this round.`}</div></div><Button onClick={saveAllTips} disabled={saving} className={`rounded-2xl px-6 py-4 text-base font-black text-slate-950 ${saveSuccess?"bg-emerald-300 hover:bg-emerald-200":"bg-emerald-400 hover:bg-emerald-300"}`}>{saving?"Saving...":saveSuccess?"✓ Saved - Save Again":"Save Tips"}</Button></CardContent></Card></div></section>}
function GameTip({game,database,currentUser,draftTips,updateTip,saving}){const tip=draftTips.find(t=>t.player_id===currentUser.id&&t.game_id===game.id); const result=getResult(game); const points=scoreTip(tip,result); const locked=isGameLocked(game,database.games); return <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 text-white"><CardContent className="p-0"><div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><Badges game={game} locked={locked} result={result}/><div className="flex items-center gap-4"><TeamBadge team={game.home} logo={game.home_logo}/><h3 className="text-2xl font-bold">{game.home} <span className="text-slate-400">v</span> {game.away}</h3><TeamBadge team={game.away} logo={game.away_logo}/></div>{tip&&<p className="mt-2 text-sm text-slate-300">Selected tip: <strong className="text-white">{tip.winner}</strong> by <strong className="text-white">{tip.margin}</strong></p>}{result&&<p className="mt-1 text-sm text-slate-300">Your score for this game: <strong className="text-white">{points} points</strong></p>}</div><div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]"><PickButtons title="Winner" options={[game.home,game.away]} value={tip?.winner} disabled={locked||saving} onPick={winner=>updateTip(game.id,{winner})}/><PickButtons title="Margin" options={["1-12","13+"]} value={tip?.margin} disabled={locked||saving} onPick={margin=>updateTip(game.id,{margin})}/></div></div></CardContent></Card>}
function TeamBadge({team,logo}){const [bad,setBad]=React.useState(false); const src=getLogo(team,logo); if(src&&!bad) return <img src={src} onError={()=>setBad(true)} className="h-12 w-12 rounded-full bg-white/10 object-contain p-1" alt={`${team} logo`}/>; return <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">{teamInitials(team)}</div>}
function Badges({game,locked,result}){return <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-300"><span className="rounded-full bg-white/10 px-3 py-1">Round {game.round}</span><span>{getPrettyKickoff(game)}</span>{locked&&<span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-amber-200"><Lock className="h-3 w-3"/> Locked</span>}{result&&<span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200"><CheckCircle2 className="h-3 w-3"/> {result.winner} by {result.marginPoints}</span>}</div>}
function PickButtons({title,options,value,disabled,onPick}){return <div className="rounded-2xl bg-slate-950/50 p-3"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div><div className="grid grid-cols-2 gap-2">{options.map(opt=><button key={opt} disabled={disabled} onClick={()=>onPick(opt)} className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${value===opt?"bg-emerald-400 text-slate-950":"bg-white/10 text-white hover:bg-white/20"}`}>{opt}</button>)}</div></div>}
function LeaderboardPanel({mode,selectedRound,leaderboard,weeklyLeaderboard,roundWinner}){const rows=mode==="weekly"?weeklyLeaderboard:leaderboard; return <Card className="rounded-3xl border border-white/10 bg-white/10 text-white"><CardContent className="p-5"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">{mode==="weekly"?`Round ${selectedRound} leaderboard`:"Overall leaderboard"}</h2><p className="text-sm text-slate-300">5 points for correct team + margin. 2 points for correct team only.</p></div><Trophy className="h-10 w-10 text-emerald-300"/></div>{mode==="weekly"&&roundWinner&&<div className="mb-5 rounded-3xl bg-emerald-400/15 p-5"><div className="text-sm uppercase tracking-wide text-emerald-200">Round winner</div><div className="mt-1 text-3xl font-black">{roundWinner.name}</div><div className="mt-1 text-slate-200">{roundWinner.total} points · {roundWinner.correctWinners} winners · {roundWinner.correctMargins} margins</div></div>}<Table rows={rows}/></CardContent></Card>}
function Table({rows}){return <><div className="grid gap-3 md:hidden">{rows.map((p,i)=><div key={p.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="flex items-center justify-between gap-3"><div><div className="text-sm text-slate-400">#{i+1}</div><div className="text-lg font-bold">{p.name} {p.role==="admin"&&<span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">Admin</span>}</div></div><div className="text-3xl font-black text-emerald-300">{p.total}</div></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{p.submitted}</div><div className="text-slate-400">Tips</div></div><div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{p.correctWinners}</div><div className="text-slate-400">Winners</div></div><div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{p.correctMargins}</div><div className="text-slate-400">Margins</div></div></div></div>)}</div><div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block"><table className="w-full border-collapse text-left"><thead className="bg-slate-950/70 text-sm uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Player</th><th className="px-4 py-3">Tips</th><th className="px-4 py-3">Winners</th><th className="px-4 py-3">Margins</th><th className="px-4 py-3 text-right">Points</th></tr></thead><tbody>{rows.map((p,i)=><tr key={p.id} className="border-t border-white/10"><td className="px-4 py-4 font-bold">#{i+1}</td><td className="px-4 py-4">{p.name} {p.role==="admin"&&<span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">Admin</span>}</td><td className="px-4 py-4 text-slate-300">{p.submitted}</td><td className="px-4 py-4 text-slate-300">{p.correctWinners}</td><td className="px-4 py-4 text-slate-300">{p.correctMargins}</td><td className="px-4 py-4 text-right text-xl font-bold text-emerald-300">{p.total}</td></tr>)}</tbody></table></div></>}

function HistoryPanel({roundSummaries,setSelectedRound,setActiveTab}){return <div className="grid gap-4">{roundSummaries.map(summary=><Card key={summary.round} className="rounded-3xl border border-white/10 bg-white/10 text-white"><CardContent className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">Round {summary.round}</h2><p className="text-sm text-slate-300">{summary.completed}/{summary.games} games completed</p>{summary.winner&&<p className="mt-2 text-emerald-200">Leader: <strong>{summary.winner.name}</strong> · {summary.winner.total} points</p>}</div><div className="flex gap-2"><Button onClick={()=>{setSelectedRound(summary.round);setActiveTab("weekly")}} className="rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">View weekly ladder</Button><Button onClick={()=>{setSelectedRound(summary.round);setActiveTab("tips")}} className="rounded-2xl bg-white/10 text-white hover:bg-white/20">View games</Button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{summary.rows.slice(0,3).map((p,i)=><div key={p.id} className="rounded-2xl bg-slate-950/50 p-3"><div className="text-sm text-slate-400">#{i+1}</div><div className="font-bold">{p.name}</div><div className="text-emerald-300">{p.total} pts</div></div>)}</div></CardContent></Card>)}</div>}

function TipCheckPanel({database,visibleGames,selectedRound}){
  const roundGames = visibleGames;
  const players = database.players.filter(p=>p.role!=="admin").sort((a,b)=>a.name.localeCompare(b.name));
  const allPlayers = database.players.sort((a,b)=>a.name.localeCompare(b.name));
  const rows = allPlayers.map(player=>{
    const submitted = roundGames.filter(game=>database.tips.some(t=>t.player_id===player.id&&t.game_id===game.id)).length;
    const total = roundGames.length;
    const missing = Math.max(total-submitted,0);
    const complete = total>0 && submitted===total;
    return {...player, submitted, total, missing, complete};
  });
  const completeCount = rows.filter(r=>r.complete).length;
  const incompleteRows = rows.filter(r=>!r.complete);
  const missingNames = incompleteRows.map(r=>`${r.name} (${r.missing} missing)`).join(", ");
  const reminderText = incompleteRows.length
    ? `Reminder: please submit your Round ${selectedRound} tips. Still missing: ${missingNames}.`
    : `Everyone has submitted their Round ${selectedRound} tips.`;

  async function copyReminder(){
    try{ await navigator.clipboard.writeText(reminderText); alert("Reminder copied."); }
    catch{ alert(reminderText); }
  }

  return <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-5">
        <h2 className="text-xl font-bold">Who has tipped?</h2>
        <p className="mt-2 text-sm text-slate-300">Round {selectedRound} tip check for all registered players.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-950/60 p-4 text-center">
            <div className="text-3xl font-black text-emerald-300">{completeCount}</div>
            <div className="text-sm text-slate-400">Complete</div>
          </div>
          <div className="rounded-2xl bg-slate-950/60 p-4 text-center">
            <div className="text-3xl font-black text-amber-300">{Math.max(rows.length-completeCount,0)}</div>
            <div className="text-sm text-slate-400">Incomplete</div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
          <div className="mb-2 text-sm font-bold text-slate-200">Reminder message</div>
          <p className="text-sm text-slate-300">{reminderText}</p>
          <Button onClick={copyReminder} className="mt-4 w-full rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">Copy reminder</Button>
        </div>
      </CardContent>
    </Card>

    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Round {selectedRound} submissions</h2>
            <p className="text-sm text-slate-300">{roundGames.length} games in this round.</p>
          </div>
        </div>

        <div className="grid gap-3 md:hidden">
          {rows.map(player=><div key={player.id} className={`rounded-2xl border p-4 ${player.complete?"border-emerald-400/20 bg-emerald-400/10":"border-amber-400/20 bg-amber-400/10"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-bold">{player.name} {player.role==="admin"&&<span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">Admin</span>}</div>
                <div className="text-sm text-slate-300">{player.email}</div>
              </div>
              <div className={`rounded-full px-3 py-1 text-sm font-bold ${player.complete?"bg-emerald-400 text-slate-950":"bg-amber-400 text-slate-950"}`}>{player.complete?"Done":"Missing"}</div>
            </div>
            <div className="mt-3 text-sm text-slate-300">{player.submitted}/{player.total} tips submitted</div>
          </div>)}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-950/70 text-sm uppercase tracking-wide text-slate-400">
              <tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Missing</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>{rows.map(player=><tr key={player.id} className="border-t border-white/10">
              <td className="px-4 py-4 font-bold">{player.name} {player.role==="admin"&&<span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">Admin</span>}</td>
              <td className="px-4 py-4 text-slate-300">{player.email}</td>
              <td className="px-4 py-4 text-slate-300">{player.submitted}/{player.total}</td>
              <td className="px-4 py-4 text-slate-300">{player.missing}</td>
              <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-sm font-bold ${player.complete?"bg-emerald-400 text-slate-950":"bg-amber-400 text-slate-950"}`}>{player.complete?"Complete":"Incomplete"}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </section>
}


function PlayerManagementPanel({database,leaderboard,updatePlayerRole,saving}){
  const players=[...database.players].sort((a,b)=>a.name.localeCompare(b.name));
  const adminCount=players.filter(p=>p.role==="admin").length;
  const playerCount=players.filter(p=>p.role!=="admin").length;

  function getStats(player){
    const row=leaderboard.find(r=>r.id===player.id);
    const totalTips=database.tips.filter(t=>t.player_id===player.id).length;
    return {points:row?.total||0,totalTips};
  }

  return <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-5">
        <h2 className="text-xl font-bold">Player management</h2>
        <p className="mt-2 text-sm text-slate-300">View users and manage admin access. Player history is kept safe.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-950/60 p-4 text-center">
            <div className="text-3xl font-black text-emerald-300">{playerCount}</div>
            <div className="text-sm text-slate-400">Players</div>
          </div>
          <div className="rounded-2xl bg-slate-950/60 p-4 text-center">
            <div className="text-3xl font-black text-sky-300">{adminCount}</div>
            <div className="text-sm text-slate-400">Admins</div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">
          Tip: avoid deleting users because it can affect old tips and leaderboard history. Promote/demote roles here instead.
        </div>
      </CardContent>
    </Card>

    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-5">
        <h2 className="mb-5 text-2xl font-bold">Registered users</h2>

        <div className="grid gap-3 md:hidden">
          {players.map(player=>{
            const stats=getStats(player);
            return <div key={player.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{player.name}</div>
                  <div className="text-sm text-slate-300">{player.email}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${player.role==="admin"?"bg-emerald-400 text-slate-950":"bg-white/10 text-white"}`}>{player.role}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{stats.points}</div><div className="text-slate-400">Points</div></div>
                <div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{stats.totalTips}</div><div className="text-slate-400">Tips</div></div>
              </div>
              <div className="mt-3 grid gap-2">
                {player.role==="admin"
                  ? <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"player")} className="rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300">Demote to player</Button>
                  : <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"admin")} className="rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">Promote to admin</Button>}
              </div>
            </div>
          })}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-950/70 text-sm uppercase tracking-wide text-slate-400">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Tips</th><th className="px-4 py-3">Points</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>{players.map(player=>{
              const stats=getStats(player);
              return <tr key={player.id} className="border-t border-white/10">
                <td className="px-4 py-4 font-bold">{player.name}</td>
                <td className="px-4 py-4 text-slate-300">{player.email}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-sm font-bold ${player.role==="admin"?"bg-emerald-400 text-slate-950":"bg-white/10 text-white"}`}>{player.role}</span></td>
                <td className="px-4 py-4 text-slate-300">{stats.totalTips}</td>
                <td className="px-4 py-4 text-emerald-300 font-bold">{stats.points}</td>
                <td className="px-4 py-4 text-right">{player.role==="admin"
                  ? <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"player")} className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300">Demote</Button>
                  : <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"admin")} className="rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">Promote</Button>}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </section>
}

function AdminPanel({visibleGames,database,selectedRound,importSeason,setImportSeason,importRound,setImportRound,importFixtures,syncResults,addFixture,toggleLockRound,updateGame,deleteFixture,clearSelectedRound,saving}){return <section className="grid gap-5 lg:grid-cols-[320px_1fr]"><Card className="rounded-3xl border border-white/10 bg-white/10 text-white"><CardContent className="p-5"><h2 className="text-xl font-bold">Admin controls</h2><p className="mt-2 text-sm text-slate-300">Paste/import fixtures, enter results, and manage round lockout.</p><div className="mt-5 grid gap-3"><Input label="Season" value={importSeason} onChange={setImportSeason}/><Input label="Round" value={importRound} onChange={setImportRound}/><a href="/api/paste-fixtures" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300"><Download className="mr-2 h-4 w-4"/> Paste fixtures</a><Button onClick={importFixtures} disabled={saving} className="rounded-2xl bg-white/10 text-white hover:bg-white/20"><Download className="mr-2 h-4 w-4"/> Try auto import</Button><Button onClick={syncResults} disabled={saving} className="rounded-2xl bg-violet-400 text-slate-950 hover:bg-violet-300"><RefreshCw className="mr-2 h-4 w-4"/> Sync results</Button><Button onClick={addFixture} disabled={saving} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200"><UserPlus className="mr-2 h-4 w-4"/> Add manual fixture</Button><Button onClick={()=>toggleLockRound(selectedRound,true)} disabled={saving} className="rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300">Lock selected round</Button><Button onClick={()=>toggleLockRound(selectedRound,false)} disabled={saving} className="rounded-2xl bg-sky-400 text-slate-950 hover:bg-sky-300">Unlock selected round</Button><Button onClick={()=>clearSelectedRound(selectedRound)} disabled={saving} className="rounded-2xl bg-red-500 text-white hover:bg-red-400"><Trash2 className="mr-2 h-4 w-4"/> Clear selected round</Button></div><div className="mt-5 rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">Auto-lock rule: once the first game in a round reaches kickoff time, every fixture in that round locks for players.</div></CardContent></Card><div className="grid gap-4">{visibleGames.map(game=><AdminGame key={game.id} game={game} database={database} updateGame={updateGame} deleteFixture={deleteFixture} saving={saving}/>)}</div></section>}
function AdminGame({game,database,updateGame,deleteFixture,saving}){const result=getResult(game); const locked=isGameLocked(game,database.games); function updateScore(field,value){const next={ [field]: value===""?null:Number(value) }; const nextHome=field==="home_score"?next[field]:game.home_score; const nextAway=field==="away_score"?next[field]:game.away_score; if(nextHome!==null&&nextHome!==""&&nextAway!==null&&nextAway!==""){next.status="completed"; next.locked=true} else {next.status="scheduled"} updateGame(game.id,next)} return <Card className="rounded-3xl border border-white/10 bg-white/10 text-white"><CardContent className="grid gap-4 p-5 xl:grid-cols-[1fr_auto] xl:items-center"><div><div className="mb-3 flex items-center gap-3"><TeamBadge team={game.home} logo={game.home_logo}/><div><h3 className="text-xl font-bold">{game.home} v {game.away}</h3><p className="text-sm text-slate-300">{getPrettyKickoff(game)} · {result?`${result.winner} by ${result.marginPoints} (${result.margin})`:"No result entered"}</p></div><TeamBadge team={game.away} logo={game.away_logo}/></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Input label="Round" value={game.round} onChange={v=>updateGame(game.id,{round:Number(v)||1})}/><Input label="Kickoff text" value={game.kickoff||""} onChange={v=>updateGame(game.id,{kickoff:v})}/><Input label="Home" value={game.home} onChange={v=>updateGame(game.id,{home:v,home_logo:getLogo(v,game.home_logo)})}/><Input label="Away" value={game.away} onChange={v=>updateGame(game.id,{away:v,away_logo:getLogo(v,game.away_logo)})}/></div></div><div className="grid gap-3 sm:grid-cols-[100px_100px_auto_auto] sm:items-end"><Input label="Home score" value={game.home_score??""} onChange={v=>updateScore("home_score",v)}/><Input label="Away score" value={game.away_score??""} onChange={v=>updateScore("away_score",v)}/><button onClick={()=>updateGame(game.id,{locked:!game.locked})} disabled={saving} className={`rounded-xl px-4 py-2 font-semibold disabled:opacity-60 ${locked?"bg-amber-400 text-slate-950":"bg-white/10 text-white hover:bg-white/20"}`}>{locked?"Locked":"Unlocked"}</button><button onClick={()=>deleteFixture(game)} disabled={saving} className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-400 disabled:opacity-60"><Trash2 className="mr-2 inline h-4 w-4"/>Delete</button></div><div className="xl:col-span-2 rounded-2xl bg-slate-950/50 p-3 text-sm text-slate-300">{result?`Result saved: ${game.home} ${game.home_score} - ${game.away_score} ${game.away}. Leaderboards update automatically.`:`Enter both scores to mark this game complete and calculate points.`}</div></CardContent></Card>}
