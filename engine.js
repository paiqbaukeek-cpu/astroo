// ===== Ultra Super Kick Off - Game Engine =====
// Pure logic. No DOM here. State is a single object persisted to localStorage.

const SAVE_KEY = 'usko_save_v1';
const POSITIONS = ['GK','DEF','MID','FWD'];

const rnd = (a,b)=> a + Math.random()*(b-a);
const irnd = (a,b)=> Math.floor(rnd(a,b+1));
const pick = arr => arr[irnd(0,arr.length-1)];
const clamp = (v,a,b)=> Math.max(a,Math.min(b,v));
let _uid = 1;
const uid = ()=> 'p'+(_uid++);

function makePlayer(pos, baseRating){
  const variance = irnd(-8,8);
  const ovr = clamp(Math.round(baseRating + variance), 45, 94);
  return {
    id: uid(),
    name: pick(FIRST_NAMES)+' '+pick(LAST_NAMES),
    pos,
    age: irnd(17,34),
    ovr,
    // sub-attributes derived from ovr with noise
    pace: clamp(ovr+irnd(-6,6),40,99),
    shoot: clamp(ovr+irnd(-6,6),40,99),
    pass: clamp(ovr+irnd(-6,6),40,99),
    defend: clamp(ovr+irnd(-6,6),40,99),
    stamina: irnd(60,99),
    morale: irnd(60,90),
    form: 0,            // -3..+3 recent form
    value: 0,           // computed
    goals: 0, assists: 0, apps: 0
  };
}

function playerValue(p){
  // value in millions, grows with ovr, peaks ~age 26
  const ageFactor = p.age<=26 ? 1 + (26-p.age)*0.03 : 1 - (p.age-26)*0.06;
  const base = Math.pow(Math.max(1,p.ovr-40),1.9)/26;
  return Math.max(0.2, +(base * clamp(ageFactor,0.4,1.6)).toFixed(1));
}

function makeSquad(clubRating){
  // realistic distribution
  const plan = { GK:3, DEF:7, MID:7, FWD:5 };
  const squad = [];
  for(const pos of POSITIONS){
    for(let i=0;i<plan[pos];i++){
      const p = makePlayer(pos, clubRating - (i>=4?6:0));
      p.value = playerValue(p);
      squad.push(p);
    }
  }
  return squad;
}

function makeClub(def){
  return {
    id: def.id, name: def.name, short: def.short, rating: def.rating,
    budget: def.budget,
    squad: makeSquad(def.rating),
    formation: '4-4-2',
    mentality: 1,           // index into MENTALITY
    lineup: [],             // player ids of starters
    P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0
  };
}

function autoPickLineup(club){
  const f = FORMATIONS[club.formation];
  const byPos = {};
  POSITIONS.forEach(p=> byPos[p] = club.squad.filter(x=>x.pos===p).sort((a,b)=> effective(b)-effective(a)));
  const ids = [];
  POSITIONS.forEach(p=>{ for(let i=0;i<f[p];i++){ if(byPos[p][i]) ids.push(byPos[p][i].id); } });
  // fill to 11 if a position is short, pull best remaining
  if(ids.length<11){
    const rest = club.squad.filter(x=>!ids.includes(x.id)).sort((a,b)=>effective(b)-effective(a));
    for(const r of rest){ if(ids.length>=11) break; ids.push(r.id); }
  }
  club.lineup = ids;
}

function effective(p){
  // overall adjusted by form & morale
  return p.ovr + p.form*1.5 + (p.morale-75)*0.08;
}

function teamStrength(club){
  if(!club.lineup || club.lineup.length<11) autoPickLineup(club);
  const starters = club.lineup.map(id=> club.squad.find(p=>p.id===id)).filter(Boolean);
  let att=0, mid=0, def=0, gk=0;
  starters.forEach(p=>{
    const e = effective(p);
    if(p.pos==='FWD') att+=e;
    else if(p.pos==='MID'){ mid+=e; att+=e*0.3; def+=e*0.3; }
    else if(p.pos==='DEF') def+=e;
    else gk+=e*1.1;
  });
  const ment = club.mentality; // 0 def,1 bal,2 att
  const attBonus = [0.92,1,1.1][ment];
  const defBonus = [1.1,1,0.9][ment];
  return {
    attack: (att*attBonus + mid*0.4)/4,
    defense: (def*defBonus + gk + mid*0.3)/4,
    overall: starters.reduce((s,p)=>s+effective(p),0)/Math.max(1,starters.length)
  };
}

// Simulate a single match, returns {home,away,events:[{minute,team,scorer}]}
function simulateMatch(home, away){
  const hs = teamStrength(home), as = teamStrength(away);
  const homeAdv = 3;
  const hAtt = hs.attack + homeAdv, aAtt = as.attack;
  const hExp = clamp((hAtt - as.defense)/8 + 1.35, 0.2, 5);
  const aExp = clamp((aAtt - hs.defense)/8 + 1.05, 0.2, 5);
  const events = [];
  function genGoals(team, exp){
    let g = 0;
    for(let m=1;m<=90;m++){
      if(Math.random() < exp/90){
        g++;
        const scorer = weightedScorer(team);
        events.push({minute:m, teamId:team.id, teamShort:team.short, scorer:scorer? scorer.name:'?' , scorerId:scorer?scorer.id:null});
      }
    }
    return g;
  }
  const hg = genGoals(home, hExp);
  const ag = genGoals(away, aExp);
  events.sort((x,y)=>x.minute-y.minute);
  return { home:hg, away:ag, events };
}

function weightedScorer(club){
  const starters = club.lineup.map(id=>club.squad.find(p=>p.id===id)).filter(Boolean);
  const pool=[];
  starters.forEach(p=>{
    let w = p.pos==='FWD'?6 : p.pos==='MID'?3 : p.pos==='DEF'?1 : 0;
    w += (p.shoot-60)/20;
    for(let i=0;i<Math.max(0,Math.round(w*2));i++) pool.push(p);
  });
  return pool.length? pick(pool) : starters[0];
}

// ===== League / Fixtures =====
function generateFixtures(clubIds){
  // double round robin
  const ids=[...clubIds];
  if(ids.length%2) ids.push(null);
  const n=ids.length, rounds=n-1, half=n/2;
  const arr=ids.slice();
  const firstLeg=[];
  for(let r=0;r<rounds;r++){
    const round=[];
    for(let i=0;i<half;i++){
      const a=arr[i], b=arr[n-1-i];
      if(a!==null&&b!==null) round.push(r%2? [b,a]:[a,b]);
    }
    firstLeg.push(round);
    arr.splice(1,0,arr.pop());
  }
  const secondLeg=firstLeg.map(round=>round.map(([a,b])=>[b,a]));
  return [...firstLeg,...secondLeg];
}

function applyResult(club, gf, ga){
  club.P++; club.GF+=gf; club.GA+=ga;
  if(gf>ga){club.W++;club.Pts+=3;}
  else if(gf===ga){club.D++;club.Pts+=1;}
  else club.L++;
}

function sortedTable(state){
  return Object.values(state.clubs).slice().sort((a,b)=>
    b.Pts-a.Pts || (b.GF-b.GA)-(a.GF-a.GA) || b.GF-a.GF || a.name.localeCompare(b.name));
}

// ===== Game state =====
function newGame(managerName, clubId){
  _uid = 1;
  const clubs = {};
  CLUBS.forEach(c=> clubs[c.id]=makeClub(c));
  Object.values(clubs).forEach(autoPickLineup);
  const state = {
    manager: managerName||'Manajer',
    myClub: clubId,
    season: 1,
    matchday: 0,
    fixtures: generateFixtures(CLUBS.map(c=>c.id)),
    clubs,
    transferMarket: buildMarket(clubs),
    results: [],
    log: []
  };
  return state;
}

function buildMarket(clubs){
  // free agents + a few listed players
  const market=[];
  for(let i=0;i<14;i++){
    const pos=pick(POSITIONS);
    const p=makePlayer(pos, irnd(60,84));
    p.value=playerValue(p);
    p.askingPrice=+(p.value*rnd(1.0,1.35)).toFixed(1);
    market.push(p);
  }
  return market;
}

function myClub(state){ return state.clubs[state.myClub]; }

function playMatchday(state){
  const round = state.fixtures[state.matchday];
  if(!round) return null;
  const dayResults=[];
  let myMatch=null;
  for(const [hId,aId] of round){
    const home=state.clubs[hId], away=state.clubs[aId];
    const res=simulateMatch(home,away);
    applyResult(home,res.home,res.away);
    applyResult(away,res.away,res.home);
    // stats
    res.events.forEach(e=>{ const sc=findPlayer(state,e.scorerId); if(sc){sc.goals++;} });
    tallyApps(home); tallyApps(away);
    const summary={homeId:hId,awayId:aId,home:res.home,away:res.away,events:res.events};
    dayResults.push(summary);
    if(hId===state.myClub||aId===state.myClub) myMatch=summary;
  }
  state.results.push(dayResults);
  state.matchday++;
  postMatchdayUpdates(state);
  return { myMatch, dayResults, finished: state.matchday>=state.fixtures.length };
}

function tallyApps(club){ club.lineup.forEach(id=>{const p=club.squad.find(x=>x.id===id); if(p)p.apps++;}); }
function findPlayer(state,id){ if(!id)return null; for(const c of Object.values(state.clubs)){const p=c.squad.find(x=>x.id===id); if(p)return p;} return null; }

function postMatchdayUpdates(state){
  // stamina drain + small random form/morale drift for all
  Object.values(state.clubs).forEach(c=>{
    c.squad.forEach(p=>{
      const played=c.lineup.includes(p.id);
      p.stamina=clamp(p.stamina+(played?-irnd(3,8):irnd(2,5)),30,99);
      p.form=clamp(p.form+irnd(-1,1)*0.5 + (played?0:0),-3,3);
      p.morale=clamp(p.morale+irnd(-3,3),40,99);
    });
  });
}

// Training: spend a training session on a player to boost an attribute.
function trainPlayer(player, attr){
  const map={pace:'pace',shoot:'shoot',pass:'pass',defend:'defend',stamina:'stamina'};
  const k=map[attr]; if(!k) return false;
  if(player[k]>=99) return false;
  const gain=irnd(1,3);
  player[k]=clamp(player[k]+gain,40,99);
  // recompute ovr as weighted avg of key attrs by position
  recalcOvr(player);
  player.value=playerValue(player);
  player.morale=clamp(player.morale+2,40,99);
  return true;
}

function recalcOvr(p){
  const w = {
    GK:{defend:.5,pass:.2,pace:.1,stamina:.2,shoot:0},
    DEF:{defend:.5,pace:.2,pass:.15,stamina:.15,shoot:0},
    MID:{pass:.35,defend:.2,shoot:.2,pace:.15,stamina:.1},
    FWD:{shoot:.4,pace:.3,pass:.15,stamina:.1,defend:.05}
  }[p.pos];
  let v=0; for(const k in w) v+=p[k]*w[k];
  p.ovr=clamp(Math.round(v),45,99);
}

// Transfers
function buyPlayer(state, marketPlayer){
  const club=myClub(state);
  if(club.budget < marketPlayer.askingPrice) return {ok:false,msg:'Anggaran tidak cukup.'};
  club.budget=+(club.budget-marketPlayer.askingPrice).toFixed(1);
  const copy={...marketPlayer}; delete copy.askingPrice;
  club.squad.push(copy);
  state.transferMarket=state.transferMarket.filter(p=>p.id!==marketPlayer.id);
  autoPickLineup(club);
  return {ok:true,msg:`${copy.name} bergabung dengan ${club.name}.`};
}

function sellPlayer(state, playerId){
  const club=myClub(state);
  if(club.squad.length<=14) return {ok:false,msg:'Skuad minimal 14 pemain.'};
  const idx=club.squad.findIndex(p=>p.id===playerId);
  if(idx<0) return {ok:false,msg:'Pemain tidak ditemukan.'};
  const p=club.squad[idx];
  const fee=+(p.value*rnd(0.85,1.1)).toFixed(1);
  club.budget=+(club.budget+fee).toFixed(1);
  club.squad.splice(idx,1);
  club.lineup=club.lineup.filter(id=>id!==playerId);
  autoPickLineup(club);
  return {ok:true,msg:`${p.name} terjual seharga ${fee} jt.`};
}

// New season: reset stats, age players, payout prize money, regenerate market
function startNewSeason(state){
  const table=sortedTable(state);
  const pos=table.findIndex(c=>c.id===state.myClub)+1;
  const prize=+(Math.max(2,(table.length-pos+1)*2.5)).toFixed(1);
  myClub(state).budget=+(myClub(state).budget+prize).toFixed(1);
  Object.values(state.clubs).forEach(c=>{
    c.P=c.W=c.D=c.L=c.GF=c.GA=c.Pts=0;
    c.squad.forEach(p=>{ p.age++; p.apps=0; p.goals=0; p.assists=0;
      if(p.age>30){ p.ovr=clamp(p.ovr-irnd(0,2),45,99); recalcOvr(p);} p.value=playerValue(p); });
  });
  state.season++;
  state.matchday=0;
  state.fixtures=generateFixtures(CLUBS.map(c=>c.id));
  state.results=[];
  state.transferMarket=buildMarket(state.clubs);
  return { pos, prize };
}

// Save/Load
function saveGame(state){ localStorage.setItem(SAVE_KEY, JSON.stringify({state,_uid})); }
function loadGame(){ const r=localStorage.getItem(SAVE_KEY); if(!r) return null; try{const d=JSON.parse(r); _uid=d._uid||1000; return d.state;}catch(e){return null;} }
function hasSave(){ return !!localStorage.getItem(SAVE_KEY); }
