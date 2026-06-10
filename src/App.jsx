import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Users, Lock, CalendarDays, Settings, CheckCircle2, LogOut, UserPlus, Database, Shield, Download, RefreshCw, Medal, Clock, ClipboardList, Trash2, UserCog, Eye } from "lucide-react";
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

const wikiLogo = (file) => `https://en.wikipedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=120`;
const warriorsLogo = "https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/Warriors_%28NRL%29_Logo.svg/250px-Warriors_%28NRL%29_Logo.svg.png";

const teamLogoMap = {
  "Broncos": wikiLogo("Brisbane Broncos logo.svg"),
  "Brisbane Broncos": wikiLogo("Brisbane Broncos logo.svg"),

  "Bulldogs": wikiLogo("Canterbury-Bankstown Bulldogs logo 2026.svg"),
  "Canterbury Bulldogs": wikiLogo("Canterbury-Bankstown Bulldogs logo 2026.svg"),
  "Canterbury-Bankstown Bulldogs": wikiLogo("Canterbury-Bankstown Bulldogs logo 2026.svg"),

  "Cowboys": wikiLogo("North Queensland Cowboys logo.svg"),
  "North Queensland Cowboys": wikiLogo("North Queensland Cowboys logo.svg"),

  "Dolphins": wikiLogo("Dolphins (NRL) Logo.svg"),
  "The Dolphins": wikiLogo("Dolphins (NRL) Logo.svg"),

  "Dragons": wikiLogo("St. George Illawarra Dragons logo.svg"),
  "St George Illawarra Dragons": wikiLogo("St. George Illawarra Dragons logo.svg"),
  "St. George Illawarra Dragons": wikiLogo("St. George Illawarra Dragons logo.svg"),

  "Eels": wikiLogo("Parramatta Eels logo.svg"),
  "Parramatta Eels": wikiLogo("Parramatta Eels logo.svg"),

  "Knights": wikiLogo("Newcastle Knights logo.svg"),
  "Newcastle Knights": wikiLogo("Newcastle Knights logo.svg"),

  "Panthers": wikiLogo("Penrith Panthers logo.svg"),
  "Penrith Panthers": wikiLogo("Penrith Panthers logo.svg"),

  "Rabbitohs": wikiLogo("South Sydney Rabbitohs Logo.svg"),
  "South Sydney Rabbitohs": wikiLogo("South Sydney Rabbitohs Logo.svg"),

  "Raiders": wikiLogo("Canberra Raiders Logo.svg"),
  "Canberra Raiders": wikiLogo("Canberra Raiders Logo.svg"),

  "Roosters": wikiLogo("Sydney Roosters logo.svg"),
  "Sydney Roosters": wikiLogo("Sydney Roosters logo.svg"),

  "Sea Eagles": wikiLogo("Manly-Warringah Sea Eagles logo.svg"),
  "Manly Sea Eagles": wikiLogo("Manly-Warringah Sea Eagles logo.svg"),
  "Manly-Warringah Sea Eagles": wikiLogo("Manly-Warringah Sea Eagles logo.svg"),

  "Sharks": wikiLogo("Cronulla-Sutherland Sharks logo.svg"),
  "Cronulla Sharks": wikiLogo("Cronulla-Sutherland Sharks logo.svg"),
  "Cronulla-Sutherland Sharks": wikiLogo("Cronulla-Sutherland Sharks logo.svg"),

  "Storm": wikiLogo("Melbourne Storm Logo.svg"),
  "Melbourne Storm": wikiLogo("Melbourne Storm Logo.svg"),

  "Titans": wikiLogo("Gold Coast Titans logo.svg"),
  "Gold Coast Titans": wikiLogo("Gold Coast Titans logo.svg"),

  "Warriors": warriorsLogo,
  "NZ Warriors": warriorsLogo,
  "New Zealand Warriors": warriorsLogo,
  "One New Zealand Warriors": warriorsLogo,

  "Tigers": wikiLogo("Wests Tigers 2022 Logo.svg"),
  "Wests Tigers": wikiLogo("Wests Tigers 2022 Logo.svg")
};

const previewDatabase = {
  currentUser: null,
  players: [{id:"admin",name:"Aaron",email:"admin@nrltips.com",role:"admin",starting_points:0},{id:"p2",name:"Ivy",email:"ivy@test.com",role:"player",starting_points:0},{id:"p3",name:"Mick",email:"mick@test.com",role:"player",starting_points:0}],
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
function getLogo(team,fallback){
  const key=String(team||"").trim();
  return teamLogoMap[key] || teamLogoMap[key.replace(/^One\s+/i,"")] || ((fallback&&String(fallback).startsWith("http"))?fallback:"");
}
function teamInitials(team){return String(team||"").split(/\s+/).map(w=>w[0]).join("").slice(0,3).toUpperCase()}
function parseSportsDate(event){const d=event.dateEvent||event.dateEventLocal; const t=(event.strTime||event.strTimeLocal||"00:00:00").split("+")[0]; return d ? new Date(`${d}T${t.endsWith("Z")?t:t+"Z"}`).toISOString() : null}
function getPrettyKickoff(game,local=false){
  if(!game.kickoff_at) return game.kickoff||"TBC";
  try{
    const options={weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"};
    if(!local) options.timeZone="Australia/Brisbane";
    const formatted=new Intl.DateTimeFormat("en-AU",options).format(new Date(game.kickoff_at));
    return local?`${formatted} local`:formatted;
  }catch{return game.kickoff||"TBC"}
}
function getRoundLockoutTime(games,round){
  const times=(games||[])
    .filter(g=>Number(g.round)===Number(round)&&g.kickoff_at)
    .map(g=>new Date(g.kickoff_at).getTime())
    .filter(t=>!Number.isNaN(t))
    .sort((a,b)=>a-b);
  return times[0]||null;
}
function formatCountdown(ms){
  if(ms<=0) return "Locked";
  const total=Math.floor(ms/1000);
  const days=Math.floor(total/86400);
  const hours=Math.floor((total%86400)/3600);
  const minutes=Math.floor((total%3600)/60);
  const seconds=total%60;
  if(days>0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if(hours>0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}
function toDateTimeLocal(value){
  if(!value) return "";
  try{
    const date=new Date(value);
    if(Number.isNaN(date.getTime())) return "";
    const pad=(n)=>String(n).padStart(2,"0");
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }catch{return ""}
}
function fromDateTimeLocal(value){
  if(!value) return null;
  const date=new Date(value);
  if(Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
function kickoffDisplayFromLocal(value,fallback="TBC"){
  const iso=fromDateTimeLocal(value);
  if(!iso) return fallback||"TBC";
  return getPrettyKickoff({kickoff_at:iso,kickoff:fallback});
}
function getResult(game){ if(game.home_score===null||game.home_score===""||game.away_score===null||game.away_score==="") return null; const h=Number(game.home_score), a=Number(game.away_score); if(Number.isNaN(h)||Number.isNaN(a)) return null; if(h===a) return {winner:"Draw",margin:"Draw",marginPoints:0,isDraw:true}; const winner=h>a?game.home:game.away; const marginPoints=Math.abs(h-a); return {winner,margin:marginPoints<=12?"1-12":"13+",marginPoints,isDraw:false}}
function scoreTip(tip,result){ if(!tip||!result) return 0; if(result.isDraw) return tip.winner==="Draw"?10:0; if(tip.winner!==result.winner) return 0; return tip.margin===result.margin?5:2 }
function formatTip(tip){ if(!tip) return ""; return tip.winner==="Draw"?"Draw":`${tip.winner} by ${tip.margin}` }
function formatResult(result){ if(!result) return ""; return result.isDraw?"Draw":`${result.winner} by ${result.marginPoints}` }
function roundLockStarted(games,round){ const times=games.filter(g=>Number(g.round)===Number(round)).map(g=>g.kickoff_at?new Date(g.kickoff_at).getTime():null).filter(Boolean); return times.length?Date.now()>=Math.min(...times):false }
function isGameLocked(game,games){ return game.locked || roundLockStarted(games,game.round) }
function getAutoCurrentRound(games){
  const rounds=[...new Set((games||[]).map(g=>Number(g.round)).filter(Boolean))].sort((a,b)=>a-b);
  if(!rounds.length) return 1;
  const firstIncomplete=rounds.find(round=>{
    const roundGames=(games||[]).filter(g=>Number(g.round)===Number(round));
    return roundGames.some(g=>!getResult(g));
  });
  return firstIncomplete||rounds[rounds.length-1];
}
function normalizeSportsEvent(event,season){ const home=event.strHomeTeam||event.strHome||"Home Team"; const away=event.strAwayTeam||event.strAway||"Away Team"; const hs=event.intHomeScore===null||event.intHomeScore===undefined||event.intHomeScore===""?null:Number(event.intHomeScore); const as=event.intAwayScore===null||event.intAwayScore===undefined||event.intAwayScore===""?null:Number(event.intAwayScore); const kickoff_at=parseSportsDate(event); return {external_id:String(event.idEvent),season:String(season||event.strSeason||new Date().getFullYear()),round:Number(event.intRound||event.intRoundNumber||1),kickoff:kickoff_at?getPrettyKickoff({kickoff_at}):(event.dateEvent||"TBC"),kickoff_at,home,away,venue:event.strVenue||null,home_logo:getLogo(home,event.strHomeTeamBadge),away_logo:getLogo(away,event.strAwayTeamBadge),locked:false,home_score:hs,away_score:as,status:hs!==null&&as!==null?"completed":"scheduled"}}
function scoreRows(players,games,tips,round=null){ const scoped=round?games.filter(g=>Number(g.round)===Number(round)):games; return players.map(p=>{ const appPoints=scoped.reduce((sum,g)=>sum+scoreTip(tips.find(t=>t.player_id===p.id&&t.game_id===g.id),getResult(g)),0); const startingPoints=round?0:Number(p.starting_points||0); const total=startingPoints+appPoints; const submitted=scoped.filter(g=>tips.find(t=>t.player_id===p.id&&t.game_id===g.id)).length; const correctWinners=scoped.filter(g=>{const tip=tips.find(t=>t.player_id===p.id&&t.game_id===g.id), r=getResult(g); return tip&&r&&tip.winner===r.winner}).length; const correctMargins=scoped.filter(g=>{const tip=tips.find(t=>t.player_id===p.id&&t.game_id===g.id), r=getResult(g); return tip&&r&&tip.winner===r.winner&&tip.margin===r.margin}).length; return {...p,total,appPoints,startingPoints,submitted,correctWinners,correctMargins}}).sort((a,b)=>b.total-a.total||b.correctWinners-a.correctWinners||b.submitted-a.submitted||String(a.name||"").localeCompare(String(b.name||""))) }

function csvEscape(value){
  const v=value===null||value===undefined?"":String(value);
  if(/[",\n\r]/.test(v)) return `"${v.replace(/"/g,'""')}"`;
  return v;
}
function downloadCsv(filename,headers,rows){
  const csv=[headers.map(csvEscape).join(","),...rows.map(row=>headers.map(h=>csvEscape(row[h])).join(","))].join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


export default function App(){
  const [database,setDatabase]=useState(previewDatabase); const [activeTab,setActiveTab]=useState("tips"); const [authMode,setAuthMode]=useState("login"); const [authForm,setAuthForm]=useState({name:"",email:"",password:"",newPassword:""}); const [authError,setAuthError]=useState(""); const [notice,setNotice]=useState(""); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [showLocalTime,setShowLocalTime]=useState(()=>localStorage.getItem("nrl-show-local-time")==="1"); const [registrationOpen,setRegistrationOpen]=useState(true); const [featureImages,setFeatureImages]=useState({14:"/weekly/round-14.png"}); const [featureRound,setFeatureRound]=useState("14"); const [featureImageUrl,setFeatureImageUrl]=useState("/weekly/round-14.png"); const [now,setNow]=useState(Date.now()); const [inviteEmail,setInviteEmail]=useState(""); const [saveSuccess,setSaveSuccess]=useState(false); const [draftTips,setDraftTips]=useState([]); const [resetSessionReady,setResetSessionReady]=useState(false); const [selectedRound,setSelectedRound]=useState(1); const [importSeason,setImportSeason]=useState(String(new Date().getFullYear())); const [importRound,setImportRound]=useState("1");
  const currentUser=database.currentUser; const isAdmin=currentUser?.role==="admin";
  const rounds=useMemo(()=>{const list=[...new Set(database.games.map(g=>Number(g.round)).filter(Boolean))].sort((a,b)=>a-b); return list.length?list:[1]},[database.games]);
  const visibleGames=database.games.filter(g=>Number(g.round)===Number(selectedRound)).sort((a,b)=>{
    const at=a.kickoff_at?new Date(a.kickoff_at).getTime():Number.MAX_SAFE_INTEGER;
    const bt=b.kickoff_at?new Date(b.kickoff_at).getTime():Number.MAX_SAFE_INTEGER;
    return at-bt || String(a.kickoff||"").localeCompare(String(b.kickoff||"")) || String(a.home||"").localeCompare(String(b.home||""));
  });
  const playerTips=database.tips.filter(t=>t.player_id===currentUser?.id); const leaderboard=useMemo(()=>scoreRows(database.players,database.games,database.tips),[database]); const weeklyLeaderboard=useMemo(()=>scoreRows(database.players,database.games,database.tips,selectedRound),[database,selectedRound]); const roundSummaries=useMemo(()=>rounds.map(round=>{const rows=scoreRows(database.players,database.games,database.tips,round); const games=database.games.filter(g=>Number(g.round)===Number(round)); const completed=games.filter(g=>getResult(g)).length; return {round, winner:rows[0], games:games.length, completed, rows};}),[rounds,database]); const roundWinner=weeklyLeaderboard[0]; const completedGames=database.games.filter(g=>getResult(g)).length; const roundLocked=roundLockStarted(database.games,selectedRound); const roundLockoutTime=getRoundLockoutTime(database.games,selectedRound); const lockoutCountdown=roundLockoutTime?formatCountdown(roundLockoutTime-now):"TBC"; const selectedFeatureImage=featureImages[String(selectedRound)]||featureImages[selectedRound]||""; const autoCurrentRound=getAutoCurrentRound(database.games);


  function exportOverallLeaderboard(){
    const rows=leaderboard.map((p,i)=>({
      Rank:i+1,
      Name:p.name,
      Email:p.email,
      Role:p.role,
      StartingPoints:p.startingPoints||0,
      AppPoints:p.appPoints||0,
      Tips:p.submitted,
      Winners:p.correctWinners,
      Margins:p.correctMargins,
      Points:p.total
    }));
    downloadCsv("overall-leaderboard.csv",["Rank","Name","Email","Role","StartingPoints","AppPoints","Tips","Winners","Margins","Points"],rows);
  }

  function exportWeeklyLeaderboard(){
    const rows=weeklyLeaderboard.map((p,i)=>({
      Rank:i+1,
      Round:selectedRound,
      Name:p.name,
      Email:p.email,
      Role:p.role,
      Tips:p.submitted,
      Winners:p.correctWinners,
      Margins:p.correctMargins,
      Points:p.total
    }));
    downloadCsv(`round-${selectedRound}-leaderboard.csv`,["Rank","Round","Name","Email","Role","Tips","Winners","Margins","Points"],rows);
  }

  function exportPlayers(){
    const rows=database.players.map(p=>{
      const row=leaderboard.find(r=>r.id===p.id)||{};
      return {
        Name:p.name,
        Email:p.email,
        Role:p.role,
        StartingPoints:Number(p.starting_points||0),
        TotalTips:database.tips.filter(t=>t.player_id===p.id).length,
        Points:row.total||0
      };
    });
    downloadCsv("players.csv",["Name","Email","Role","StartingPoints","TotalTips","Points"],rows);
  }

  function exportTipCheck(){
    const rows=database.players.map(p=>{
      const submitted=visibleGames.filter(g=>database.tips.some(t=>t.player_id===p.id&&t.game_id===g.id)).length;
      const total=visibleGames.length;
      return {
        Round:selectedRound,
        Name:p.name,
        Email:p.email,
        Role:p.role,
        Submitted:submitted,
        Missing:Math.max(total-submitted,0),
        Status:total>0&&submitted===total?"Complete":"Incomplete"
      };
    });
    downloadCsv(`round-${selectedRound}-tip-check.csv`,["Round","Name","Email","Role","Submitted","Missing","Status"],rows);
  }




  async function loadRegistrationSetting(){
    if(!hasSupabase)return true;
    try{
      const {data,error}=await supabase.from("app_settings").select("value").eq("key","registration_open").limit(1);
      if(error||!data||!data.length){setRegistrationOpen(true); return true}
      const open=data[0]?.value===true||data[0]?.value==="true";
      setRegistrationOpen(open);
      return open;
    }catch{
      setRegistrationOpen(true);
      return true;
    }
  }

  async function setRegistrationSetting(open){
    if(!isAdmin)return;
    setSaving(true); setAuthError(""); setNotice("");
    if(!hasSupabase){
      setRegistrationOpen(open);
      setNotice(open?"Registration opened.":"Registration closed.");
      setSaving(false);
      return;
    }
    const {error}=await supabase.from("app_settings").upsert({key:"registration_open",value:open},{onConflict:"key"});
    if(error)setAuthError(error.message);
    else{
      setRegistrationOpen(open);
      setNotice(open?"Registration opened.":"Registration closed. Existing players can still log in.");
    }
    setSaving(false);
  }

  async function loadFeatureImages(){
    const fallback={14:"/weekly/round-14.png"};
    if(!hasSupabase){
      setFeatureImages(fallback);
      return fallback;
    }
    try{
      const {data,error}=await supabase.from("app_settings").select("value").eq("key","round_feature_images").limit(1);
      if(error||!data||!data.length){
        setFeatureImages(fallback);
        return fallback;
      }
      const value=data[0]?.value||{};
      const next={...fallback,...value};
      setFeatureImages(next);
      return next;
    }catch{
      setFeatureImages(fallback);
      return fallback;
    }
  }

  async function saveFeatureImage(){
    if(!isAdmin)return;
    const round=String(featureRound||"").trim();
    const url=String(featureImageUrl||"").trim();
    if(!round||!url){setAuthError("Enter a round and image URL."); return}
    setSaving(true); setAuthError(""); setNotice("");
    const next={...featureImages,[round]:url};
    if(!hasSupabase){
      setFeatureImages(next);
      setNotice(`Round ${round} feature image updated.`);
      setSaving(false);
      return;
    }
    const {error}=await supabase.from("app_settings").upsert({key:"round_feature_images",value:next},{onConflict:"key"});
    if(error)setAuthError(error.message);
    else{
      setFeatureImages(next);
      setNotice(`Round ${round} feature image updated.`);
    }
    setSaving(false);
  }

  function backupAllData(){
    const backup={
      exportedAt:new Date().toISOString(),
      players:database.players,
      games:database.games,
      tips:database.tips
    };
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`nrl-tipping-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function refreshSupabaseData(userProfile=currentUser){ if(!supabase||!userProfile)return; setLoading(true); const [{data:profiles,error:pe},{data:games,error:ge},{data:tips,error:te}]=await Promise.all([supabase.from("profiles").select("id,name,email,role,starting_points").order("name"),supabase.from("games").select("*").order("round").order("kickoff_at",{nullsFirst:false}),supabase.from("tips").select("id,player_id,game_id,winner,margin,updated_at")]); if(pe||ge||te){setAuthError(pe?.message||ge?.message||te?.message||"Could not load database."); setLoading(false); return} const fresh=profiles.find(p=>p.id===userProfile.id)||userProfile; setDatabase({currentUser:fresh,players:profiles||[],games:games||[],tips:tips||[]}); if((games||[]).length&&!rounds.includes(Number(selectedRound))) setSelectedRound(getAutoCurrentRound(games||[])); setLoading(false) }
  useEffect(()=>{async function boot(){
    if(!hasSupabase){
      const local=loadPreviewDatabase();
      setDatabase(local);
      setSelectedRound(getAutoCurrentRound(local.games||[]));
      setLoading(false);
      return;
    }

    await loadRegistrationSetting();
    await loadFeatureImages();

    const url=new URL(window.location.href);
    const params=url.searchParams;
    const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
    const isResetLink=params.get("reset")==="1" || params.get("type")==="recovery" || hash.get("type")==="recovery";

    const code=params.get("code");
    if(code){
      const {error}=await supabase.auth.exchangeCodeForSession(code);
      if(error){
        setAuthError(error.message);
        setAuthMode("login");
      }else{
        setAuthMode("resetPassword");
        setResetSessionReady(true);
      }
      window.history.replaceState({},document.title,window.location.pathname);
      setLoading(false);
      return;
    }

    const access_token=hash.get("access_token");
    const refresh_token=hash.get("refresh_token");
    if(isResetLink&&access_token&&refresh_token){
      const {error}=await supabase.auth.setSession({access_token,refresh_token});
      if(error){
        setAuthError(error.message);
        setAuthMode("login");
      }else{
        setAuthMode("resetPassword");
        setResetSessionReady(true);
      }
      window.history.replaceState({},document.title,window.location.pathname);
      setLoading(false);
      return;
    }

    const {data}=await supabase.auth.getSession();
    const user=data?.session?.user;

    if(isResetLink&&user){
      setAuthMode("resetPassword");
      setResetSessionReady(true);
      window.history.replaceState({},document.title,window.location.pathname);
      setLoading(false);
      return;
    }

    if(!user){
      setLoading(false);
      return;
    }

    const {data:profile}=await supabase.from("profiles").select("id,name,email,role,starting_points").eq("id",user.id).single();
    if(profile) await refreshSupabaseData(profile);
    setLoading(false);
  } boot()},[]);

  useEffect(()=>{
    if(!hasSupabase)return;
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==="PASSWORD_RECOVERY"){
        setAuthMode("resetPassword");
        setResetSessionReady(true);
        setDatabase(prev=>({...prev,currentUser:null}));
      }
    });
    return ()=>subscription?.unsubscribe?.();
  },[]);
  useEffect(()=>{ if(!hasSupabase) savePreviewDatabase(database)},[database]);
  useEffect(()=>{ if(!rounds.includes(Number(selectedRound))&&rounds[0]) setSelectedRound(getAutoCurrentRound(database.games))},[rounds,selectedRound,database.games]);
  useEffect(()=>{ if(currentUser) setDraftTips(database.tips.filter(t=>t.player_id===currentUser.id)); else setDraftTips([]) },[currentUser?.id,database.tips]);
  useEffect(()=>{localStorage.setItem("nrl-show-local-time",showLocalTime?"1":"0")},[showLocalTime]);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(timer)},[]);
  useEffect(()=>{ if(!registrationOpen&&authMode==="register") setAuthMode("login") },[registrationOpen,authMode]);

  async function handleAuth(e){ e.preventDefault(); setAuthError(""); const email=authForm.email.trim().toLowerCase(), password=authForm.password.trim(), name=authForm.name.trim(); if(authMode==="register"&&!registrationOpen){setAuthError("Registration is currently closed. Ask the admin for an invite."); return} if(!email||!password||(authMode==="register"&&!name)){setAuthError("Please fill in the required fields."); return} if(!hasSupabase){ if(authMode==="register"){const newPlayer={id:makeId("player"),name,email,role:"player",starting_points:0}; setDatabase({...database,currentUser:newPlayer,players:[...database.players,newPlayer]}); return} setDatabase({...database,currentUser:database.players.find(p=>p.email.toLowerCase()===email)||database.players[0]}); return} setSaving(true); if(authMode==="register"){ const {data,error}=await supabase.auth.signUp({email,password}); if(error){setSaving(false);return setAuthError(error.message)} const profile={id:data.user.id,name,email,role:"player",starting_points:0}; const {error:profileError}=await supabase.from("profiles").insert(profile); if(profileError){setSaving(false);return setAuthError(profileError.message)} await refreshSupabaseData(profile); setSaving(false); return} const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error){setSaving(false);return setAuthError(error.message)} const {data:profile,error:profileError}=await supabase.from("profiles").select("id,name,email,role,starting_points").eq("id",data.user.id).single(); if(profileError){setSaving(false);return setAuthError(profileError.message)} await refreshSupabaseData(profile); setSaving(false)}
  async function logout(){ if(hasSupabase) await supabase.auth.signOut(); setDatabase({...database,currentUser:null}); setActiveTab("tips") }

  async function sendPasswordReset(){
    setAuthError(""); setNotice("");
    const email=authForm.email.trim().toLowerCase();
    if(!email){setAuthError("Enter your email address first."); return}
    if(!hasSupabase){setNotice("Password reset only works in the live Supabase app."); return}
    setSaving(true);
    const redirectTo=`${window.location.origin}/?reset=1`;
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});
    if(error) setAuthError(error.message);
    else setNotice("Password reset email sent. Check your inbox and spam folder. The link may take a minute to arrive.");
    setSaving(false);
  }

  async function updatePassword(e){
    e.preventDefault();
    setAuthError(""); setNotice("");
    const password=authForm.newPassword.trim();
    if(password.length<6){setAuthError("Password must be at least 6 characters."); return}
    if(!hasSupabase){setAuthError("Password reset only works in the live Supabase app."); return}
    setSaving(true);
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){
      setAuthError("Reset session is not ready. Open the latest reset link from your email.");
      setSaving(false);
      return;
    }
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

  async function invitePlayer(){
    if(!isAdmin)return;
    const email=inviteEmail.trim().toLowerCase();
    if(!email){setAuthError("Enter an email address to invite."); return}
    setSaving(true); setAuthError(""); setNotice("");
    try{
      const response=await fetch("/api/invite-player",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email})
      });
      const result=await response.json();
      if(!response.ok||!result.ok) throw new Error(result.error||"Could not send invite.");
      setNotice(`Invite sent to ${email}.`);
      setInviteEmail("");
      await refreshSupabaseData(currentUser);
    }catch(error){
      setAuthError(error.message||"Could not send invite.");
    }
    setSaving(false);
  }



  async function updatePlayerStartingPoints(playerId,points){
    if(!isAdmin)return;
    const value=Number(points);
    if(Number.isNaN(value)||value<0){setAuthError("Starting points must be 0 or more."); return}
    const target=database.players.find(p=>p.id===playerId);
    if(!target)return;
    setSaving(true); setAuthError(""); setNotice("");
    if(!hasSupabase){
      const updatedPlayers=database.players.map(p=>p.id===playerId?{...p,starting_points:value}:p);
      const updatedCurrent=database.currentUser?.id===playerId?{...database.currentUser,starting_points:value}:database.currentUser;
      setDatabase({...database,currentUser:updatedCurrent,players:updatedPlayers});
      setNotice(`Starting points updated for ${target.name||target.email}.`);
      setSaving(false);
      return;
    }
    try{
      const {data:{session}}=await supabase.auth.getSession();
      const response=await fetch("/api/update-player",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${session?.access_token||""}`
        },
        body:JSON.stringify({playerId,starting_points:value})
      });
      const result=await response.json();
      if(!response.ok||!result.ok) throw new Error(result.error||"Could not update starting points.");
      setNotice(`Starting points updated for ${target.name||target.email}.`);
      await refreshSupabaseData(currentUser);
    }catch(error){
      setAuthError(error.message||"Could not update starting points.");
    }
    setSaving(false);
  }

  async function deletePlayer(playerId){
    if(!isAdmin)return;
    const target=database.players.find(p=>p.id===playerId);
    if(!target)return;
    if(target.id===currentUser.id){setAuthError("You cannot delete your own admin account while logged in."); return}
    const ok=window.confirm(`Delete ${target.name||target.email}? This removes their account, profile and tips. This cannot be undone.`);
    if(!ok)return;
    setSaving(true); setAuthError(""); setNotice("");
    if(!hasSupabase){
      setDatabase({...database,players:database.players.filter(p=>p.id!==playerId),tips:database.tips.filter(t=>t.player_id!==playerId)});
      setNotice(`${target.name||target.email} deleted.`);
      setSaving(false);
      return;
    }
    try{
      const {data:{session}}=await supabase.auth.getSession();
      const response=await fetch("/api/delete-player",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${session?.access_token||""}`
        },
        body:JSON.stringify({playerId})
      });
      const result=await response.json();
      if(!response.ok||!result.ok) throw new Error(result.error||"Could not delete player.");
      setNotice(`${target.name||target.email} deleted.`);
      await refreshSupabaseData(currentUser);
    }catch(error){
      setAuthError(error.message||"Could not delete player.");
    }
    setSaving(false);
  }

  async function updatePlayerName(playerId,name){
    if(!isAdmin)return;
    const cleanName=String(name||"").trim();
    if(!cleanName){setAuthError("Name cannot be blank."); return}
    const target=database.players.find(p=>p.id===playerId);
    if(!target)return;
    setSaving(true); setAuthError(""); setNotice("");
    if(!hasSupabase){
      const updatedPlayers=database.players.map(p=>p.id===playerId?{...p,name:cleanName}:p);
      const updatedCurrent=database.currentUser?.id===playerId?{...database.currentUser,name:cleanName}:database.currentUser;
      setDatabase({...database,currentUser:updatedCurrent,players:updatedPlayers});
      setNotice(`Name updated to ${cleanName}.`);
      setSaving(false);
      return;
    }
    try{
      const {data:{session}}=await supabase.auth.getSession();
      const response=await fetch("/api/update-player",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${session?.access_token||""}`
        },
        body:JSON.stringify({playerId,name:cleanName})
      });
      const result=await response.json();
      if(!response.ok||!result.ok) throw new Error(result.error||"Could not update name.");
      setNotice(`Name updated to ${cleanName}.`);
      await refreshSupabaseData(currentUser);
    }catch(error){
      setAuthError(error.message||"Could not update name.");
    }
    setSaving(false);
  }

  async function updatePlayerRole(playerId,role){
    if(!isAdmin)return;
    const target=database.players.find(p=>p.id===playerId);
    if(!target)return;
    if(target.id===currentUser.id&&role!=="admin"){
      const ok=window.confirm("You are about to demote yourself from admin. You may lose admin access. Continue?");
      if(!ok)return;
    }
    setSaving(true); setAuthError(""); setNotice("");
    if(!hasSupabase){
      setDatabase({...database,players:database.players.map(p=>p.id===playerId?{...p,role}:p)});
      setNotice(`${target.name||target.email||"Player"} is now ${role}.`);
      setSaving(false);
      return;
    }
    const {error}=await supabase.from("profiles").update({role}).eq("id",playerId);
    if(error)setAuthError(error.message);
    else setNotice(`${target.name||target.email||"Player"} is now ${role}.`);
    await refreshSupabaseData(currentUser);
    setSaving(false);
  }

function updateTip(gameId,update){
    setSaveSuccess(false);
    if(!currentUser)return;
    const game=database.games.find(g=>g.id===gameId);
    if(isGameLocked(game,database.games))return;
    const existing=draftTips.find(t=>t.player_id===currentUser.id&&t.game_id===gameId);
    let next={id:existing?.id||makeId("tip"),player_id:currentUser.id,game_id:gameId,winner:existing?.winner||game.home,margin:existing?.margin||"1-12",...update};
    if(update.winner==="Draw") next={...next,winner:"Draw",margin:"Draw"};
    if(update.winner&&update.winner!=="Draw"&&existing?.winner==="Draw"&&!update.margin) next={...next,margin:"1-12"};
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
  async function syncResults(){
    if(!isAdmin)return;
    setSaving(true); setAuthError(""); setNotice("");
    try{
      if(!hasSupabase){
        setNotice("Result sync only works on the live app.");
        setSaving(false);
        return;
      }
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.access_token)throw new Error("Please log in again.");
      const response=await fetch("/api/sync-results",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${session.access_token}`
        },
        body:JSON.stringify({season:importSeason,round:selectedRound})
      });
      const json=await response.json();
      if(!response.ok||!json.ok)throw new Error(json.error||"Could not sync results.");
      await refreshSupabaseData(currentUser);
      const source=json.source?` Source: ${json.source}.`:"";
      const unmatched=json.unmatched?.length?` ${json.unmatched.length} fixture(s) were not matched.`:"";
      setNotice(json.updated>0?`Synced ${json.updated} completed result(s).${source}${unmatched} Please check the scores in Admin.`:`No completed results found for Round ${selectedRound} yet.${source}${unmatched}`);
    }catch(error){
      setAuthError(error.message||"Could not sync results.");
    }
    setSaving(false)
  }

  if(loading)return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading tipping comp...</div>;
  if(!currentUser)return <LoginScreen authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} authError={authError} notice={notice} registrationOpen={registrationOpen} handleAuth={handleAuth} sendPasswordReset={sendPasswordReset} updatePassword={updatePassword} saving={saving}/>;

  return <div className="min-h-screen bg-slate-950 text-white"><div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"/><div className="absolute top-96 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"/></div><main className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
    <Header currentUser={currentUser} isAdmin={isAdmin} database={database} completedGames={completedGames} selectedRound={selectedRound} roundLocked={roundLocked} lockoutCountdown={lockoutCountdown} roundLockoutTime={roundLockoutTime} selectedFeatureImage={selectedFeatureImage} logout={logout}/>
    {authError&&<div className="mb-4 rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="mb-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
    <RoundSelector rounds={rounds} selectedRound={selectedRound} setSelectedRound={setSelectedRound} roundLocked={roundLocked} autoCurrentRound={autoCurrentRound} showLocalTime={showLocalTime} setShowLocalTime={setShowLocalTime}/>
    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin}/>
    {activeTab==="tips"&&<TipsPanel visibleGames={visibleGames} database={database} currentUser={currentUser} playerTips={playerTips} draftTips={draftTips} leaderboard={leaderboard} updateTip={updateTip} saveAllTips={saveAllTips} saveSuccess={saveSuccess} saving={saving} showLocalTime={showLocalTime} setShowLocalTime={setShowLocalTime}/>} 
    {(activeTab==="leaderboard"||activeTab==="weekly")&&<LeaderboardPanel mode={activeTab} selectedRound={selectedRound} leaderboard={leaderboard} weeklyLeaderboard={weeklyLeaderboard} roundWinner={roundWinner} exportOverallLeaderboard={exportOverallLeaderboard} exportWeeklyLeaderboard={exportWeeklyLeaderboard}/>} {activeTab==="history"&&<HistoryPanel roundSummaries={roundSummaries} setSelectedRound={setSelectedRound} setActiveTab={setActiveTab}/>} 
    {activeTab==="reveal"&&<RevealTipsPanel database={database} visibleGames={visibleGames} selectedRound={selectedRound} roundLocked={roundLocked} showLocalTime={showLocalTime}/>} 
    {activeTab==="adminTips"&&isAdmin&&<TipCheckPanel database={database} visibleGames={visibleGames} selectedRound={selectedRound} exportTipCheck={exportTipCheck}/>} 
    {activeTab==="adminPlayers"&&isAdmin&&<PlayerManagementPanel database={database} leaderboard={leaderboard} inviteEmail={inviteEmail} setInviteEmail={setInviteEmail} invitePlayer={invitePlayer} updatePlayerName={updatePlayerName} updatePlayerStartingPoints={updatePlayerStartingPoints} deletePlayer={deletePlayer} updatePlayerRole={updatePlayerRole} exportPlayers={exportPlayers} saving={saving}/>} 
    {activeTab==="admin"&&isAdmin&&<AdminPanel visibleGames={visibleGames} database={database} selectedRound={selectedRound} importSeason={importSeason} setImportSeason={setImportSeason} importRound={importRound} setImportRound={setImportRound} importFixtures={importFixtures} syncResults={syncResults} addFixture={addFixture} toggleLockRound={toggleLockRound} updateGame={updateGame} deleteFixture={deleteFixture} clearSelectedRound={clearSelectedRound} backupAllData={backupAllData} featureRound={featureRound} setFeatureRound={setFeatureRound} featureImageUrl={featureImageUrl} setFeatureImageUrl={setFeatureImageUrl} saveFeatureImage={saveFeatureImage} registrationOpen={registrationOpen} setRegistrationSetting={setRegistrationSetting} saving={saving}/>} 
  </main></div>;
}

function LoginScreen({authMode,setAuthMode,authForm,setAuthForm,authError,notice,registrationOpen,handleAuth,sendPasswordReset,updatePassword,saving}){return <div className="min-h-screen bg-slate-950 px-4 py-8 text-white"><div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"/><div className="absolute top-96 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"/></div><main className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px] lg:items-center"><motion.section initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200"><Trophy className="h-4 w-4"/> NRL Tipping Comp</div><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Login, tip each round, climb the leaderboard.</h1><p className="mt-4 max-w-2xl text-lg text-slate-300">Live NRL tipping comp with weekly fixtures, round lockout, results, team logos, and leaderboards.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Info icon={<Database/>} title="Real database" text="Supabase stores games, tips and profiles."/><Info icon={<Shield/>} title="Secure auth" text="Email/password login through Supabase."/><Info icon={<Clock/>} title="Round lockout" text="Whole round locks at first kickoff."/></div></motion.section><Card className="border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur"><CardContent className="p-6">
{authMode!=="forgotPassword"&&authMode!=="resetPassword"&&<div className="mb-5 flex rounded-2xl bg-slate-950/70 p-1"><button onClick={()=>setAuthMode("login")} className={`flex-1 rounded-xl px-4 py-3 font-semibold ${authMode==="login"?"bg-emerald-400 text-slate-950":"text-slate-300"}`}>Login</button>{registrationOpen&&<button onClick={()=>setAuthMode("register")} className={`flex-1 rounded-xl px-4 py-3 font-semibold ${authMode==="register"?"bg-emerald-400 text-slate-950":"text-slate-300"}`}>Register</button>}</div>}

{authMode==="resetPassword"?<form onSubmit={updatePassword} className="grid gap-4"><h2 className="text-2xl font-bold">Set a new password</h2><p className="text-sm text-slate-300">Enter your new password below.</p><Input label="New password" type="password" value={authForm.newPassword} onChange={v=>setAuthForm({...authForm,newPassword:v})} placeholder="New password"/>{authError&&<div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}<Button type="submit" disabled={saving} className="rounded-2xl bg-emerald-400 py-6 text-base font-bold text-slate-950 hover:bg-emerald-300">{saving?"Saving...":"Update password"}</Button></form>:authMode==="forgotPassword"?<div className="grid gap-4"><h2 className="text-2xl font-bold">Reset password</h2><p className="text-sm text-slate-300">Enter your email and Supabase will send you a password reset link.</p><Input label="Email" value={authForm.email} onChange={v=>setAuthForm({...authForm,email:v})} placeholder="you@email.com"/>{authError&&<div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}<Button onClick={sendPasswordReset} disabled={saving} className="rounded-2xl bg-emerald-400 py-6 text-base font-bold text-slate-950 hover:bg-emerald-300">{saving?"Sending...":"Send reset email"}</Button><button onClick={()=>setAuthMode("login")} className="text-sm font-semibold text-slate-300 hover:text-white">Back to login</button></div>:<form onSubmit={handleAuth} className="grid gap-4">{!registrationOpen&&authMode==="login"&&<div className="rounded-2xl bg-amber-400/15 px-4 py-3 text-sm text-amber-100">Registration is closed. Existing players can still log in. New players need an admin invite.</div>}{authMode==="register"&&<Input label="Name" value={authForm.name} onChange={v=>setAuthForm({...authForm,name:v})} placeholder="Your name"/>}<Input label="Email" value={authForm.email} onChange={v=>setAuthForm({...authForm,email:v})} placeholder="you@email.com"/><Input label="Password" type="password" value={authForm.password} onChange={v=>setAuthForm({...authForm,password:v})} placeholder="Password"/>{authError&&<div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{authError}</div>}{notice&&<div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{notice}</div>}<Button type="submit" disabled={saving} className="rounded-2xl bg-emerald-400 py-6 text-base font-bold text-slate-950 hover:bg-emerald-300">{saving?"Please wait...":authMode==="login"?"Login":"Create account"}</Button>{authMode==="login"&&<button type="button" onClick={()=>setAuthMode("forgotPassword")} className="text-sm font-semibold text-slate-300 hover:text-white">Forgot password?</button>}</form>}
</CardContent></Card></main></div>}
function Info({icon,title,text}){return <div className="rounded-2xl bg-white/10 p-4">{React.cloneElement(icon,{className:"mb-3 h-6 w-6 text-emerald-300"})}<div className="font-bold">{title}</div><div className="text-sm text-slate-300">{text}</div></div>}
function Input({label,value,onChange,placeholder,type="text"}){return <label className="text-sm font-medium text-slate-300">{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none" placeholder={placeholder}/></label>}
function Header({currentUser,isAdmin,database,completedGames,selectedRound,roundLocked,lockoutCountdown,roundLockoutTime,selectedFeatureImage,logout}){
  return <motion.header initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur lg:flex-row lg:items-stretch lg:justify-between">
    <div className="flex min-w-0 flex-1 flex-col justify-center">
      <div className={`inline-flex w-fit flex-col rounded-3xl px-5 py-4 ${roundLocked?"bg-amber-400/15":"bg-emerald-400/15"}`}>
        <div className="text-sm font-bold uppercase tracking-wide text-slate-300">Round {selectedRound} lockout</div>
        <div className={`mt-1 text-4xl font-black tracking-tight sm:text-5xl ${roundLocked?"text-amber-200":"text-emerald-300"}`}>{roundLocked?"Locked":lockoutCountdown}</div>
        <div className="mt-1 text-sm text-slate-300">{roundLocked?"This round is locked.":roundLockoutTime?"until first game starts":"Kickoff time not set yet."}</div>
      </div>
      <p className="mt-3 max-w-2xl text-slate-300">Logged in as <strong className="text-white">{currentUser.name}</strong> · {isAdmin?"Admin":"Player"} · Round {selectedRound} {roundLocked?"is locked":"is open"}</p>
    </div>

    {selectedFeatureImage&&<div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 lg:w-[360px]">
      <img src={selectedFeatureImage} alt={`Round ${selectedRound} feature`} className="h-48 w-full object-cover lg:h-full"/>
    </div>}

    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center lg:min-w-[260px] lg:grid-cols-1">
      <Card className="border-white/10 bg-white/10 text-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center"><Stat n={database.players.length} t="Players"/><Stat n={database.games.length} t="Games"/><Stat n={completedGames} t="Done"/></div>
        </CardContent>
      </Card>
      <Button onClick={logout} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200"><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
    </div>
  </motion.header>
}
function Stat({n,t}){return <div><div className="text-2xl font-bold">{n}</div><div className="text-xs text-slate-300">{t}</div></div>}
function RoundSelector({rounds,selectedRound,setSelectedRound,roundLocked,autoCurrentRound,showLocalTime,setShowLocalTime}){
  return <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-wrap gap-2">
      {autoCurrentRound&&<button onClick={()=>setSelectedRound(autoCurrentRound)} className="rounded-2xl bg-sky-400 px-4 py-2 font-bold text-slate-950 hover:bg-sky-300">Current Round</button>}
      {rounds.map(r=><button key={r} onClick={()=>setSelectedRound(r)} className={`rounded-2xl px-4 py-2 font-bold ${Number(selectedRound)===Number(r)?"bg-emerald-400 text-slate-950":"bg-white/10 text-slate-200 hover:bg-white/20"}`}>Round {r}</button>)}
    </div>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button onClick={()=>setShowLocalTime(!showLocalTime)} className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20">
        {showLocalTime?"Show Brisbane Time":"Show My Local Time"}
      </button>
      <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold ${roundLocked?"bg-amber-400/20 text-amber-100":"bg-emerald-400/20 text-emerald-100"}`}><Clock className="h-4 w-4"/> {roundLocked?"Whole round locked":"Tips open until first game starts"}</div>
    </div>
  </div>
}
function Tabs({activeTab,setActiveTab,isAdmin}){const tabs=[["tips","Tips",CalendarDays],["leaderboard","Overall",Users],["weekly","Weekly",Medal],["history","History",Trophy],["reveal","Tips Reveal",Eye],...(isAdmin?[["adminTips","Tip Check",ClipboardList],["adminPlayers","Players",UserCog],["admin","Admin",Settings]]:[])];return <div className={`mb-6 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur sm:gap-3 sm:p-3 ${isAdmin?"sm:grid-cols-7":"sm:grid-cols-4"}`}>{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setActiveTab(id)} className={`flex items-center justify-center gap-1 rounded-2xl px-3 py-3 text-sm font-semibold transition sm:gap-2 sm:px-4 sm:text-base ${activeTab===id?"bg-emerald-400 text-slate-950":"bg-white/5 text-slate-200 hover:bg-white/10"}`}><Icon className="h-4 w-4"/> {label}</button>)}</div>}
function TipsPanel({visibleGames,database,currentUser,playerTips,draftTips,leaderboard,updateTip,saveAllTips,saveSuccess,saving,showLocalTime,setShowLocalTime}){
  const submittedCount=visibleGames.filter(g=>playerTips.some(t=>t.game_id===g.id)).length;
  const draftCount=visibleGames.filter(g=>draftTips.some(t=>t.game_id===g.id)).length;
  const remaining=Math.max(visibleGames.length-draftCount,0);

  const hasUnsavedChanges=visibleGames.some(game=>{
    const saved=playerTips.find(t=>t.game_id===game.id);
    const draft=draftTips.find(t=>t.player_id===currentUser.id&&t.game_id===game.id);
    if(!saved&&!draft)return false;
    if(!saved&&draft)return true;
    if(saved&&!draft)return true;
    return saved.winner!==draft.winner||saved.margin!==draft.margin;
  });

  return <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
    <Card className="border-white/10 bg-white/10 text-white rounded-3xl">
      <CardContent className="p-5">
        <h2 className="mb-3 text-lg font-bold">Your tips</h2>
        <div className="mb-4 rounded-2xl bg-slate-950/60 p-3">
          <div className="mb-2 text-xs font-bold text-slate-300">{showLocalTime?"Times shown in your local time":"Times shown in Brisbane time"}</div>
          <button onClick={()=>setShowLocalTime(!showLocalTime)} className="w-full rounded-xl bg-emerald-400 px-3 py-2 text-sm font-black text-slate-950 hover:bg-emerald-300">
            {showLocalTime?"Show Brisbane Time":"Show My Local Time"}
          </button>
        </div>
        <p className="text-sm text-slate-300">Pick every game. Use the button above to switch between Brisbane time and your local device time.</p>
        <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
          <div className="text-sm text-slate-400">Saved tips</div>
          <div className="mt-1 text-3xl font-bold">{submittedCount}/{visibleGames.length}</div>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
          <div className="text-sm text-slate-400">Tips remaining</div>
          <div className="mt-1 text-3xl font-bold text-amber-300">{remaining}</div>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
          <div className="text-sm text-slate-400">Current points</div>
          <div className="mt-1 text-3xl font-bold text-emerald-300">{leaderboard.find(p=>p.id===currentUser.id)?.total||0}</div>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-4">
      {saveSuccess&&<Card className="rounded-3xl border border-emerald-400/40 bg-emerald-500/15 text-white">
        <CardContent className="p-4">
          <p className="font-bold text-emerald-100">✓ Tips saved successfully.</p>
        </CardContent>
      </Card>}

      {visibleGames.map(game=><GameTip key={game.id} game={game} database={database} currentUser={currentUser} draftTips={draftTips} updateTip={updateTip} saving={saving} showLocalTime={showLocalTime}/>)}

      {(hasUnsavedChanges||saving)&&<Card className="sticky bottom-3 z-20 rounded-3xl border border-emerald-400/30 bg-slate-900/95 text-white shadow-2xl backdrop-blur">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-bold">Unsaved changes</div>
            <div className="text-sm text-slate-300">{draftCount}/{visibleGames.length} tips selected for this round.</div>
          </div>
          <Button onClick={saveAllTips} disabled={saving} className="rounded-2xl bg-emerald-400 px-6 py-4 text-base font-black text-slate-950 hover:bg-emerald-300">
            {saving?"Saving...":"Save Tips"}
          </Button>
        </CardContent>
      </Card>}
    </div>
  </section>
}
function GameTip({game,database,currentUser,draftTips,updateTip,saving,showLocalTime}){
  const tip=draftTips.find(t=>t.player_id===currentUser.id&&t.game_id===game.id);
  const result=getResult(game);
  const points=scoreTip(tip,result);
  const locked=isGameLocked(game,database.games);

  return <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 text-white">
    <CardContent className="p-0">
      <div className="grid gap-4 p-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
        <div>
          <Badges game={game} locked={locked} result={result}/>
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-5">
              <TeamBadge team={game.home} logo={game.home_logo}/>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-black text-slate-300">v</div>
              <TeamBadge team={game.away} logo={game.away_logo}/>
            </div>
            <div className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-200">
              <Clock className="h-4 w-4 text-emerald-300"/> {getPrettyKickoff(game)}
            </div>
          </div>
          {tip&&<p className="mt-3 text-sm text-slate-300">Selected tip: <strong className="text-white">{formatTip(tip)}</strong></p>}
          {result&&<p className="mt-1 text-sm text-slate-300">Your score for this game: <strong className="text-white">{points} points</strong></p>}
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <PickButtons title="Winner" options={[game.home,game.away,"Draw"]} value={tip?.winner} disabled={locked||saving} onPick={winner=>updateTip(game.id,{winner})}/>
          <PickButtons title={tip?.winner==="Draw"?"Margin not needed":"Margin"} options={["1-12","13+"]} value={tip?.winner==="Draw"?"":tip?.margin} disabled={locked||saving||tip?.winner==="Draw"} onPick={margin=>updateTip(game.id,{margin})}/>
        </div>
      </div>
    </CardContent>
  </Card>
}

function TeamBadge({team,logo}){const [bad,setBad]=React.useState(false); const src=getLogo(team,logo); React.useEffect(()=>{setBad(false)},[team,logo]); if(src&&!bad) return <img src={src} onError={()=>setBad(true)} className="h-12 w-12 rounded-full bg-white/10 object-contain p-1" alt={`${team} logo`}/>; return <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">{teamInitials(team)}</div>}
function Badges({game,locked,result}){return <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-300"><span className="rounded-full bg-white/10 px-3 py-1">Round {game.round}</span>{locked&&<span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-amber-200"><Lock className="h-3 w-3"/> Locked</span>}{result&&<span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200"><CheckCircle2 className="h-3 w-3"/> {formatResult(result)}</span>}</div>}
function PickButtons({title,options,value,disabled,onPick}){return <div className="h-full rounded-2xl bg-slate-950/50 p-3"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div><div className={`grid gap-2 ${options.length===3?"grid-cols-3":"grid-cols-2"}`}>{options.map(opt=><button key={opt} disabled={disabled} onClick={()=>onPick(opt)} className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${value===opt?"bg-emerald-400 text-slate-950":"bg-white/10 text-white hover:bg-white/20"}`}>{opt}</button>)}</div></div>}
function LeaderboardPanel({mode,selectedRound,leaderboard,weeklyLeaderboard,roundWinner,exportOverallLeaderboard,exportWeeklyLeaderboard}){const rows=mode==="weekly"?weeklyLeaderboard:leaderboard; return <Card className="rounded-3xl border border-white/10 bg-white/10 text-white"><CardContent className="p-5"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">{mode==="weekly"?`Round ${selectedRound} leaderboard`:"Overall leaderboard"}</h2><p className="text-sm text-slate-300">10 points for picking a draw. 5 points for correct team + margin. 2 points for correct team only.</p></div><div className="flex items-center gap-3"><Button onClick={mode==="weekly"?exportWeeklyLeaderboard:exportOverallLeaderboard} className="rounded-2xl bg-white/10 text-white hover:bg-white/20"><Download className="mr-2 h-4 w-4"/> Export CSV</Button><Trophy className="h-10 w-10 text-emerald-300"/></div></div>{mode==="weekly"&&roundWinner&&<div className="mb-5 rounded-3xl bg-emerald-400/15 p-5"><div className="text-sm uppercase tracking-wide text-emerald-200">Round winner</div><div className="mt-1 text-3xl font-black">{roundWinner.name}</div><div className="mt-1 text-slate-200">{roundWinner.total} points · {roundWinner.correctWinners} winners · {roundWinner.correctMargins} margins</div></div>}<Table rows={rows}/></CardContent></Card>}
function Table({rows}){return <><div className="grid gap-3 md:hidden">{rows.map((p,i)=><div key={p.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="flex items-center justify-between gap-3"><div><div className="text-sm text-slate-400">#{i+1}</div><div className="text-lg font-bold">{p.name} {p.role==="admin"&&<span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">Admin</span>}</div></div><div className="text-3xl font-black text-emerald-300">{p.total}</div></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{p.submitted}</div><div className="text-slate-400">Tips</div></div><div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{p.correctWinners}</div><div className="text-slate-400">Winners</div></div><div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{p.correctMargins}</div><div className="text-slate-400">Margins</div></div></div></div>)}</div><div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block"><table className="w-full table-fixed border-collapse text-left text-sm"><thead className="bg-slate-950/70 text-sm uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Player</th><th className="px-4 py-3">Tips</th><th className="px-4 py-3">Winners</th><th className="px-4 py-3">Margins</th><th className="px-4 py-3 text-right">Points</th></tr></thead><tbody>{rows.map((p,i)=><tr key={p.id} className="border-t border-white/10"><td className="px-4 py-4 font-bold">#{i+1}</td><td className="px-4 py-4">{p.name} {p.role==="admin"&&<span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">Admin</span>}</td><td className="px-4 py-4 text-slate-300">{p.submitted}</td><td className="px-4 py-4 text-slate-300">{p.correctWinners}</td><td className="px-4 py-4 text-slate-300">{p.correctMargins}</td><td className="px-4 py-4 text-right text-xl font-bold text-emerald-300">{p.total}</td></tr>)}</tbody></table></div></>}

function HistoryPanel({roundSummaries,setSelectedRound,setActiveTab}){return <div className="grid gap-4">{roundSummaries.map(summary=><Card key={summary.round} className="rounded-3xl border border-white/10 bg-white/10 text-white"><CardContent className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">Round {summary.round}</h2><p className="text-sm text-slate-300">{summary.completed}/{summary.games} games completed</p>{summary.winner&&<p className="mt-2 text-emerald-200">Leader: <strong>{summary.winner.name}</strong> · {summary.winner.total} points</p>}</div><div className="flex gap-2"><Button onClick={()=>{setSelectedRound(summary.round);setActiveTab("weekly")}} className="rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">View weekly ladder</Button><Button onClick={()=>{setSelectedRound(summary.round);setActiveTab("tips")}} className="rounded-2xl bg-white/10 text-white hover:bg-white/20">View games</Button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{summary.rows.slice(0,3).map((p,i)=><div key={p.id} className="rounded-2xl bg-slate-950/50 p-3"><div className="text-sm text-slate-400">#{i+1}</div><div className="font-bold">{p.name}</div><div className="text-emerald-300">{p.total} pts</div></div>)}</div></CardContent></Card>)}</div>}


function RevealTipsPanel({database,visibleGames,selectedRound,roundLocked,showLocalTime}){
  const players=[...(database.players||[])].sort((a,b)=>String(a.name||a.email||"").localeCompare(String(b.name||b.email||"")));
  const games=[...(visibleGames||[])];

  function playerName(player){
    return player.name || player.email || "Unnamed player";
  }

  function tipFor(player,game){
    return (database.tips||[]).find(t=>t.player_id===player.id&&t.game_id===game.id);
  }

  if(!roundLocked){
    return <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold">Tips Reveal</h2>
        <p className="mt-2 text-slate-300">Everyone’s tips will be visible here once Round {selectedRound} locks.</p>
        <div className="mt-5 rounded-2xl bg-amber-400/15 p-4 text-amber-100">
          Tips are hidden until the first game of the round starts, so nobody can copy other players before lockout.
        </div>
      </CardContent>
    </Card>
  }

  if(!games.length){
    return <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold">Tips Reveal</h2>
        <p className="mt-2 text-slate-300">No fixtures found for Round {selectedRound}.</p>
      </CardContent>
    </Card>
  }

  return <section className="grid gap-5">
    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Round {selectedRound} Tips Reveal</h2>
            <p className="mt-1 text-slate-300">The round is locked, so everyone can now see each other’s tips.</p>
          </div>
          <div className="rounded-2xl bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-200">Visible after lockout</div>
        </div>
      </CardContent>
    </Card>

    {games.map(game=>{
      const result=getResult(game);
      return <Card key={game.id} className="rounded-3xl border border-white/10 bg-white/10 text-white">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <TeamBadge team={game.home} logo={game.home_logo}/>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-black text-slate-300">v</div>
              <TeamBadge team={game.away} logo={game.away_logo}/>
              <div>
                <div className="font-bold">{game.home} v {game.away}</div>
                <div className="text-sm text-slate-300">{getPrettyKickoff(game,showLocalTime)}</div>
              </div>
            </div>
            {result&&<div className="rounded-2xl bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-200">Result: {formatResult(result)}</div>}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {players.map(player=>{
              const tip=tipFor(player,game);
              const points=scoreTip(tip,result);
              return <div key={`${player.id}-${game.id}`} className="rounded-2xl bg-slate-950/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold">{playerName(player)}</div>
                    <div className="text-sm text-slate-300">{tip?formatTip(tip):"No tip submitted"}</div>
                  </div>
                  {result&&<div className="shrink-0 rounded-xl bg-white/10 px-3 py-1 text-sm font-bold text-emerald-300">{points}</div>}
                </div>
              </div>
            })}
          </div>
        </CardContent>
      </Card>
    })}
  </section>
}

function TipCheckPanel({database,visibleGames,selectedRound,exportTipCheck}){
  const roundGames = visibleGames;
  const players = database.players.filter(p=>p.role!=="admin").sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
  const allPlayers = [...database.players].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
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

  return <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
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
          <Button onClick={copyReminder} className="mt-4 w-full rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">Copy reminder</Button><Button onClick={exportTipCheck} className="mt-3 w-full rounded-2xl bg-white/10 text-white hover:bg-white/20"><Download className="mr-2 h-4 w-4"/> Export tip check CSV</Button>
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




function PlayerManagementPanel({database,leaderboard,inviteEmail,setInviteEmail,invitePlayer,updatePlayerName,updatePlayerStartingPoints,deletePlayer,updatePlayerRole,exportPlayers,saving}){
  const players=[...(database.players||[])].sort((a,b)=>String(a.name||a.email||"").localeCompare(String(b.name||b.email||"")));
  const adminCount=players.filter(p=>p.role==="admin").length;
  const playerCount=players.filter(p=>p.role!=="admin").length;

  function displayName(player){return player.name || player.email || "Unnamed player"}
  function displayEmail(player){return player.email || "No email"}
  function getStats(player){
    const row=(leaderboard||[]).find(r=>r.id===player.id);
    const totalTips=(database.tips||[]).filter(t=>t.player_id===player.id).length;
    return {points:row?.total||0,totalTips};
  }
  function promptEditName(player){
    const next=window.prompt("Enter display name", displayName(player));
    if(next===null)return;
    updatePlayerName(player.id,next);
  }
  function promptEditPoints(player){
    const next=window.prompt("Enter current competition points", String(player.starting_points||0));
    if(next===null)return;
    updatePlayerStartingPoints(player.id,next);
  }

  return <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold">Player management</h2>
        <p className="mt-2 text-sm text-slate-300">View users, carry-over points and admin access. Player history is kept safe.</p>
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
          Starting points are the current ladder points from before this app took over.
        </div>
        <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
          <div className="mb-2 text-sm font-bold text-slate-200">Invite a player</div>
          <Input label="Email" value={inviteEmail} onChange={setInviteEmail} placeholder="player@email.com"/>
          <Button onClick={invitePlayer} disabled={saving} className="mt-3 w-full rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">{saving?"Sending...":"Send Invite"}</Button>
          <p className="mt-3 text-xs text-slate-400">They will receive an email link to create their account.</p>
        </div>
      </CardContent>
    </Card>

    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Registered users</h2>
          <Button onClick={exportPlayers} className="rounded-2xl bg-white/10 text-white hover:bg-white/20"><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
        </div>

        <div className="grid gap-3 md:hidden">
          {players.map(player=>{
            const stats=getStats(player);
            return <div key={player.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{displayName(player)}</div>
                  <div className="text-sm text-slate-300">{displayEmail(player)}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${player.role==="admin"?"bg-emerald-400 text-slate-950":"bg-white/10 text-white"}`}>{player.role||"player"}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{player.starting_points||0}</div><div className="text-slate-400">Start</div></div>
                <div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{stats.points}</div><div className="text-slate-400">Total</div></div>
                <div className="rounded-xl bg-white/5 p-2"><div className="font-bold">{stats.totalTips}</div><div className="text-slate-400">Tips</div></div>
              </div>
              <div className="mt-3 grid gap-2">
                <Button disabled={saving} onClick={()=>promptEditName(player)} className="rounded-2xl bg-white/10 text-white hover:bg-white/20">Edit Name</Button>
                <Button disabled={saving} onClick={()=>promptEditPoints(player)} className="rounded-2xl bg-sky-400 text-slate-950 hover:bg-sky-300">Edit Points</Button>
                {player.role==="admin"
                  ? <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"player")} className="rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300">Demote to player</Button>
                  : <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"admin")} className="rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">Promote to admin</Button>}
                <Button disabled={saving||player.id===database.currentUser?.id} onClick={()=>deletePlayer(player.id)} className="rounded-2xl bg-red-500 text-white hover:bg-red-400">Delete Player</Button>
              </div>
            </div>
          })}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-slate-950/70 text-sm uppercase tracking-wide text-slate-400">
              <tr><th className="w-[17%] px-3 py-3">Name</th><th className="w-[27%] px-3 py-3">Email</th><th className="w-[11%] px-3 py-3">Role</th><th className="w-[8%] px-3 py-3">Start</th><th className="w-[7%] px-3 py-3">Tips</th><th className="w-[8%] px-3 py-3">Pts</th><th className="w-[22%] px-3 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>{players.map(player=>{
              const stats=getStats(player);
              return <tr key={player.id} className="border-t border-white/10">
                <td className="px-3 py-3 font-bold"><div className="truncate">{displayName(player)}</div></td>
                <td className="px-3 py-3 text-slate-300"><div className="truncate">{displayEmail(player)}</div></td>
                <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${player.role==="admin"?"bg-emerald-400 text-slate-950":"bg-white/10 text-white"}`}>{player.role||"player"}</span></td>
                <td className="px-3 py-3 text-slate-300">{player.starting_points||0}</td>
                <td className="px-3 py-3 text-slate-300">{stats.totalTips}</td>
                <td className="px-3 py-3 font-bold text-emerald-300">{stats.points}</td>
                <td className="px-3 py-3 text-right">
                  <div className="grid grid-cols-2 gap-2">
                    <Button disabled={saving} onClick={()=>promptEditName(player)} className="rounded-xl bg-white/10 px-2 py-2 text-xs text-white hover:bg-white/20">Name</Button>
                    <Button disabled={saving} onClick={()=>promptEditPoints(player)} className="rounded-xl bg-sky-400 px-2 py-2 text-xs text-slate-950 hover:bg-sky-300">Points</Button>
                    {player.role==="admin"
                      ? <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"player")} className="rounded-xl bg-amber-400 px-2 py-2 text-xs text-slate-950 hover:bg-amber-300">Demote</Button>
                      : <Button disabled={saving} onClick={()=>updatePlayerRole(player.id,"admin")} className="rounded-xl bg-emerald-400 px-2 py-2 text-xs text-slate-950 hover:bg-emerald-300">Promote</Button>}
                    <Button disabled={saving||player.id===database.currentUser?.id} onClick={()=>deletePlayer(player.id)} className="rounded-xl bg-red-500 px-2 py-2 text-xs text-white hover:bg-red-400">Delete</Button>
                  </div>
                </td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </section>
}

function AdminPanel({visibleGames,database,selectedRound,importSeason,setImportSeason,importRound,setImportRound,importFixtures,syncResults,addFixture,toggleLockRound,updateGame,deleteFixture,clearSelectedRound,backupAllData,featureRound,setFeatureRound,featureImageUrl,setFeatureImageUrl,saveFeatureImage,registrationOpen,setRegistrationSetting,saving}){
  return <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
    <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
      <CardContent className="p-5">
        <h2 className="text-xl font-bold">Admin controls</h2>
        <p className="mt-2 text-sm text-slate-300">Paste/import fixtures, enter results, and manage round lockout.</p>
        <div className="mt-5 grid gap-3">
          <Input label="Season" value={importSeason} onChange={setImportSeason}/>
          <Input label="Round" value={importRound} onChange={setImportRound}/>
          <a href="/api/paste-fixtures" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300"><Download className="mr-2 h-4 w-4"/> Paste fixtures</a>
          <Button onClick={importFixtures} disabled={saving} className="rounded-2xl bg-white/10 text-white hover:bg-white/20"><Download className="mr-2 h-4 w-4"/> Try auto import</Button>
          <Button onClick={syncResults} disabled={saving} className="rounded-2xl bg-violet-400 text-slate-950 hover:bg-violet-300"><RefreshCw className="mr-2 h-4 w-4"/> Sync results</Button>
          <Button onClick={addFixture} disabled={saving} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200"><UserPlus className="mr-2 h-4 w-4"/> Add manual fixture</Button>
          <Button onClick={()=>toggleLockRound(selectedRound,true)} disabled={saving} className="rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300">Lock selected round</Button>
          <Button onClick={()=>toggleLockRound(selectedRound,false)} disabled={saving} className="rounded-2xl bg-sky-400 text-slate-950 hover:bg-sky-300">Unlock selected round</Button>
          <Button onClick={()=>clearSelectedRound(selectedRound)} disabled={saving} className="rounded-2xl bg-red-500 text-white hover:bg-red-400"><Trash2 className="mr-2 h-4 w-4"/> Clear selected round</Button>
          <Button onClick={backupAllData} disabled={saving} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400"><Download className="mr-2 h-4 w-4"/> Backup All Data</Button>
          <Button onClick={()=>setRegistrationSetting(!registrationOpen)} disabled={saving} className={`rounded-2xl ${registrationOpen?"bg-amber-400 text-slate-950 hover:bg-amber-300":"bg-emerald-400 text-slate-950 hover:bg-emerald-300"}`}>{registrationOpen?"Close Registration":"Open Registration"}</Button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">Auto-lock rule: once the first game in a round reaches kickoff time, every fixture in that round locks for players.</div>

        <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
          <div className="mb-2 text-sm font-bold text-slate-200">Round feature image</div>
          <div className="grid gap-3">
            <Input label="Round" value={featureRound} onChange={setFeatureRound}/>
            <Input label="Image URL" value={featureImageUrl} onChange={setFeatureImageUrl} placeholder="/weekly/round-14.png"/>
            <Button onClick={saveFeatureImage} disabled={saving} className="rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300">Save Image</Button>
            <p className="text-xs text-slate-400">Upload images to public/weekly and use paths like /weekly/round-15.png.</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-4">{visibleGames.map(game=><AdminGame key={game.id} game={game} database={database} updateGame={updateGame} deleteFixture={deleteFixture} saving={saving}/>)}</div>
  </section>
}
function AdminGame({game,database,updateGame,deleteFixture,saving}){
  const result=getResult(game);
  const locked=isGameLocked(game,database.games);
  const [draft,setDraft]=React.useState({
    round:game.round,
    kickoff:game.kickoff||"",
    kickoff_at_local:toDateTimeLocal(game.kickoff_at),
    home:game.home||"",
    away:game.away||"",
    home_score:game.home_score??"",
    away_score:game.away_score??""
  });

  React.useEffect(()=>{
    setDraft({
      round:game.round,
      kickoff:game.kickoff||"",
      kickoff_at_local:toDateTimeLocal(game.kickoff_at),
      home:game.home||"",
      away:game.away||"",
      home_score:game.home_score??"",
      away_score:game.away_score??""
    });
  },[game.id,game.round,game.kickoff,game.kickoff_at,game.home,game.away,game.home_score,game.away_score]);

  function setField(field,value){
    setDraft({...draft,[field]:value});
  }

  function saveFixture(){
    const homeScore=draft.home_score===""?null:Number(draft.home_score);
    const awayScore=draft.away_score===""?null:Number(draft.away_score);
    const kickoffAt=fromDateTimeLocal(draft.kickoff_at_local);
    const kickoffText=kickoffAt?kickoffDisplayFromLocal(draft.kickoff_at_local,draft.kickoff):draft.kickoff;

    const update={
      round:Number(draft.round)||1,
      kickoff:kickoffText||"TBC",
      kickoff_at:kickoffAt,
      home:draft.home,
      away:draft.away,
      home_logo:getLogo(draft.home,game.home_logo),
      away_logo:getLogo(draft.away,game.away_logo),
      home_score:Number.isNaN(homeScore)?null:homeScore,
      away_score:Number.isNaN(awayScore)?null:awayScore
    };
    if(update.home_score!==null&&update.away_score!==null){
      update.status="completed";
      update.locked=true;
    }else{
      update.status="scheduled";
    }
    updateGame(game.id,update);
  }

  const draftResult=getResult({
    ...game,
    home:draft.home,
    away:draft.away,
    home_score:draft.home_score,
    away_score:draft.away_score
  });

  const shownKickoff=draft.kickoff_at_local?kickoffDisplayFromLocal(draft.kickoff_at_local,draft.kickoff):(draft.kickoff||"TBC");

  return <Card className="rounded-3xl border border-white/10 bg-white/10 text-white">
    <CardContent className="grid gap-4 p-5 xl:grid-cols-[1fr_auto] xl:items-center">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <TeamBadge team={draft.home} logo={game.home_logo}/>
          <div>
            <h3 className="text-xl font-bold">{draft.home} v {draft.away}</h3>
            <p className="text-sm text-slate-300">{shownKickoff} · {draftResult?formatResult(draftResult):"No result entered"}</p>
          </div>
          <TeamBadge team={draft.away} logo={game.away_logo}/>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input label="Round" value={draft.round} onChange={v=>setField("round",v)}/>
          <label className="text-sm font-medium text-slate-300">Kickoff date/time
            <input type="datetime-local" value={draft.kickoff_at_local} onChange={e=>setField("kickoff_at_local",e.target.value)} className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"/>
          </label>
          <Input label="Kickoff text fallback" value={draft.kickoff} onChange={v=>setField("kickoff",v)} placeholder="Thu 7:50pm"/>
          <Input label="Home" value={draft.home} onChange={v=>setField("home",v)}/>
          <Input label="Away" value={draft.away} onChange={v=>setField("away",v)}/>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[100px_100px_auto_auto_auto] sm:items-end">
        <Input label="Home score" value={draft.home_score} onChange={v=>setField("home_score",v)}/>
        <Input label="Away score" value={draft.away_score} onChange={v=>setField("away_score",v)}/>
        <button onClick={saveFixture} disabled={saving} className="rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60">Save Fixture</button>
        <button onClick={()=>updateGame(game.id,{locked:!game.locked})} disabled={saving} className={`rounded-xl px-4 py-2 font-semibold disabled:opacity-60 ${locked?"bg-amber-400 text-slate-950":"bg-white/10 text-white hover:bg-white/20"}`}>{locked?"Locked":"Unlocked"}</button>
        <button onClick={()=>deleteFixture(game)} disabled={saving} className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-400 disabled:opacity-60"><Trash2 className="mr-2 inline h-4 w-4"/>Delete</button>
      </div>
      <div className="xl:col-span-2 rounded-2xl bg-slate-950/50 p-3 text-sm text-slate-300">
        {draftResult?`Result ready: ${draft.home} ${draft.home_score} - ${draft.away_score} ${draft.away}. Click Save Fixture to update the leaderboard.`:`Set kickoff date/time, edit fields, then click Save Fixture. Fixtures will show in kickoff order.`}
      </div>
    </CardContent>
  </Card>
}
