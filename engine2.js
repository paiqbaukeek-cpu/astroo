// ===== Ultra Super Kick Off - World Engine =====
// Builds on engine.js primitives (rnd, irnd, pick, clamp, makePlayer style).
// Manages many leagues, knockout cups (UCL/ACL), 4-yearly World Cup, history & season cycle.

const SAVE_KEY2 = 'usko_world_v1';
const POS = ['GK','DEF','MID','FWD'];
const rnd2=(a,b)=>a+Math.random()*(b-a);
const irnd2=(a,b)=>Math.floor(rnd2(a,b+1));
const pick2=a=>a[irnd2(0,a.length-1)];
const clamp2=(v,a,b)=>Math.max(a,Math.min(b,v));
let _wuid=1; const wuid=()=>'w'+(_wuid++);

function nameFor(nat){
  const pool=NAME_POOLS[nat]||NAME_POOLS.ENG;
  return pick2(pool.first)+' '+pick2(pool.last);
}

function genPlayer(pos, base, nat){
  const ovr=clamp2(Math.round(base+irnd2(-7,7)),48,93);
  const p={ id:wuid(), name:nameFor(nat), nat, pos, age:irnd2(17,34), ovr,
    pace:clamp2(ovr+irnd2(-6,6),40,99), shoot:clamp2(ovr+irnd2(-6,6),40,99),
    pass:clamp2(ovr+irnd2(-6,6),40,99), defend:clamp2(ovr+irnd2(-6,6),40,99),
    stamina:irnd2(60,99), morale:irnd2(60,90), form:0, goals:0, apps:0, value:0 };
  p.value=valueOf(p); return p;
}
function valueOf(p){
  const af=p.age<=26?1+(26-p.age)*0.03:1-(p.age-26)*0.06;
  const base=Math.pow(Math.max(1,p.ovr-40),1.9)/26;
  return Math.max(0.2,+(base*clamp2(af,0.4,1.6)).toFixed(1));
}
function genSquad(rating, nat){
  const plan={GK:3,DEF:7,MID:7,FWD:5}, sq=[];
  for(const pos of POS) for(let i=0;i<plan[pos];i++) sq.push(genPlayer(pos, rating-(i>=4?6:0), foreignSometimes(nat)));
  return sq;
}
// 70% players share club nationality, 30% are foreign (random nation).
function foreignSometimes(homeNat){
  if(Math.random()<0.7) return homeNat;
  return pick2(NATIONS).code;
}

function clubStrength(club){
  const xi=startingXI(club);
  let att=0,def=0,gk=0,mid=0;
  xi.forEach(p=>{const e=p.ovr+p.form*1.5;
    if(p.pos==='FWD')att+=e; else if(p.pos==='MID'){mid+=e;att+=e*0.3;def+=e*0.3;}
    else if(p.pos==='DEF')def+=e; else gk+=e*1.1;});
  return { attack:(att+mid*0.4)/4, defense:(def+gk+mid*0.3)/4,
    overall: xi.reduce((s,p)=>s+p.ovr,0)/Math.max(1,xi.length) };
}
function startingXI(club){
  const f={GK:1,DEF:4,MID:4,FWD:2};
  const xi=[]; POS.forEach(pos=>{
    const list=club.squad.filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr);
    for(let i=0;i<f[pos];i++) if(list[i]) xi.push(list[i]);
  });
  if(xi.length<11){const rest=club.squad.filter(p=>!xi.includes(p)).sort((a,b)=>b.ovr-a.ovr);
    for(const r of rest){if(xi.length>=11)break; xi.push(r);}}
  return xi;
}

function simMatch(home, away, neutral){
  const hs=clubStrength(home), as=clubStrength(away);
  const adv=neutral?0:3;
  const hExp=clamp2((hs.attack+adv-as.defense)/8+1.3,0.2,5);
  const aExp=clamp2((as.attack-hs.defense)/8+1.05,0.2,5);
  const scorers=[];
  const go=(team,exp)=>{let g=0;for(let m=1;m<=90;m++)if(Math.random()<exp/90){g++;const s=scorer(team);scorers.push({m,team:team.id,name:s?s.name:'?',sid:s?s.id:null});}return g;};
  const hg=go(home,hExp), ag=go(away,aExp);
  scorers.sort((a,b)=>a.m-b.m);
  return {home:hg,away:ag,scorers};
}
function scorer(club){const xi=startingXI(club),pool=[];
  xi.forEach(p=>{let w=p.pos==='FWD'?6:p.pos==='MID'?3:p.pos==='DEF'?1:0; w+=(p.shoot-60)/20;
    for(let i=0;i<Math.max(0,Math.round(w*2));i++)pool.push(p);});
  return pool.length?pick2(pool):xi[0];}

// round robin (double)
function fixtures(ids){
  const a=[...ids]; if(a.length%2)a.push(null);
  const n=a.length,r=n-1,h=n/2,first=[];
  for(let k=0;k<r;k++){const round=[];for(let i=0;i<h;i++){const x=a[i],y=a[n-1-i];
    if(x!==null&&y!==null)round.push(k%2?[y,x]:[x,y]);}first.push(round);a.splice(1,0,a.pop());}
  return [...first,...first.map(rd=>rd.map(([x,y])=>[y,x]))];
}
function applyRes(c,gf,ga){c.P++;c.GF+=gf;c.GA+=ga;if(gf>ga){c.W++;c.Pts+=3;}else if(gf===ga){c.D++;c.Pts+=1;}else c.L++;}
function tableOf(world, leagueId){
  return Object.values(world.clubs).filter(c=>c.league===leagueId)
    .sort((a,b)=>b.Pts-a.Pts||(b.GF-b.GA)-(a.GF-a.GA)||b.GF-a.GF||a.name.localeCompare(b.name));
}

// ===== World build =====
function newWorld(managerName, clubId, seasonLabel){
  _wuid=1; const clubs={};
  LEAGUES.forEach(L=>L.clubs.forEach(def=>{
    const id=wuid();
    clubs[id]={id,name:def.name,rating:def.rating,league:L.id,country:L.country,
      budget:+(def.rating-55).toFixed(1), squad:genSquad(def.rating,L.country),
      P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0};
  }));
  const myClub = clubId || Object.values(clubs).find(c=>c.league==='idn1').id;
  const world={
    manager:managerName||'Manajer', myClub, seasonLabel:seasonLabel||'25/26', seasonNum:1,
    clubs, leagueFix:{}, leagueDay:{}, results:{},
    cont:null, contFix:[], contRound:0,
    worldCup:null, history:[], market:[]
  };
  LEAGUES.forEach(L=>{const ids=Object.values(clubs).filter(c=>c.league===L.id).map(c=>c.id);
    world.leagueFix[L.id]=fixtures(ids); world.leagueDay[L.id]=0; world.results[L.id]=[];});
  world.market=buildMarket2();
  return world;
}
function buildMarket2(){const m=[];for(let i=0;i<18;i++){const nat=pick2(NATIONS).code;const p=genPlayer(pick2(POS),irnd2(60,86),nat);p.askingPrice=+(p.value*rnd2(1,1.35)).toFixed(1);m.push(p);}return m;}
function myLeague(world){return world.clubs[world.myClub].league;}

// Play one matchday across ALL leagues simultaneously.
function playWorldMatchday(world){
  let myMatch=null;
  LEAGUES.forEach(L=>{
    const day=world.leagueDay[L.id], round=world.leagueFix[L.id][day];
    if(!round) return;
    const dayRes=[];
    round.forEach(([hId,aId])=>{const h=world.clubs[hId],a=world.clubs[aId];
      const r=simMatch(h,a,false); applyRes(h,r.home,r.away); applyRes(a,r.away,r.home);
      r.scorers.forEach(s=>{const p=findP(world,s.sid);if(p)p.goals++;});
      const sum={homeId:hId,awayId:aId,home:r.home,away:r.away,scorers:r.scorers};
      dayRes.push(sum);
      if(hId===world.myClub||aId===world.myClub)myMatch=sum;});
    world.results[L.id].push(dayRes); world.leagueDay[L.id]++;
  });
  drift(world);
  const total=world.leagueFix[myLeague(world)].length;
  return {myMatch, leagueDone: world.leagueDay[myLeague(world)]>=total};
}
function findP(world,id){if(!id)return null;for(const c of Object.values(world.clubs)){const p=c.squad.find(x=>x.id===id);if(p)return p;}return null;}
function drift(world){Object.values(world.clubs).forEach(c=>c.squad.forEach(p=>{p.form=clamp2(p.form+irnd2(-1,1)*0.5,-3,3);p.morale=clamp2(p.morale+irnd2(-3,3),40,99);}));}

// ===== Continental knockout (UCL) - simple single-elimination from top finishers =====
function buildContinental(world){
  const qualified=[];
  CONTINENTAL.leagues.forEach(lid=>{tableOf(world,lid).slice(0,CONTINENTAL.perLeague).forEach(c=>qualified.push(c.id));});
  // pad to power of two
  let size=1; while(size<qualified.length)size*=2;
  while(qualified.length<size)qualified.push(qualified[irnd2(0,qualified.length-1)]);
  world.cont={id:CONTINENTAL.id,name:CONTINENTAL.name,bracket:shuffle(qualified),winner:null,rounds:[]};
}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=irnd2(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function playContinental(world){
  if(!world.cont) buildContinental(world);
  let teams=world.cont.bracket;
  while(teams.length>1){
    const next=[],roundLog=[];
    for(let i=0;i<teams.length;i+=2){
      const h=world.clubs[teams[i]],a=world.clubs[teams[i+1]];
      let r=simMatch(h,a,true);
      let hw=r.home,aw=r.away; if(hw===aw){Math.random()<0.5?hw++:aw++;} // penalties
      const win=hw>aw?h:a;
      roundLog.push(`${h.name} ${r.home}-${r.away} ${a.name} → ${win.name}`);
      next.push(win.id);
    }
    world.cont.rounds.push({n:teams.length,log:roundLog});
    teams=next;
  }
  world.cont.winner=teams[0];
  return world.clubs[teams[0]];
}

// ===== World Cup (every 4 seasons) =====
function buildNationalTeams(world){
  const teams={};
  NATIONS.forEach(N=>{
    const players=[];
    Object.values(world.clubs).forEach(c=>c.squad.forEach(p=>{if(p.nat===N.code)players.push(p);}));
    players.sort((a,b)=>b.ovr-a.ovr);
    teams[N.code]={id:N.code,name:N.name,rating:N.rating,squad:players.slice(0,18).length?players.slice(0,18):[genPlayer('FWD',N.rating,N.code)]};
  });
  return teams;
}
function playWorldCup(world){
  const teams=buildNationalTeams(world);
  let bracket=shuffle(NATIONS.map(n=>n.code));
  let size=1;while(size<bracket.length)size*=2;while(bracket.length<size)bracket.push(bracket[irnd2(0,bracket.length-1)]);
  const rounds=[];
  let cur=bracket;
  while(cur.length>1){
    const next=[],log=[];
    for(let i=0;i<cur.length;i+=2){
      const A=teams[cur[i]],B=teams[cur[i+1]];
      const ar=A.rating+irnd2(-8,8),br=B.rating+irnd2(-8,8);
      const ga=Math.max(0,Math.round((ar-br)/15+rnd2(0,2))),gb=Math.max(0,Math.round((br-ar)/15+rnd2(0,2)));
      let win=ga>gb?A:gb>ga?B:(Math.random()<0.5?A:B);
      log.push(`${A.name} ${ga}-${gb} ${B.name} → ${win.name}`); next.push(win.id);
    }
    rounds.push({n:cur.length,log}); cur=next;
  }
  return {winner:teams[cur[0]].name, rounds};
}

// ===== Season cycle =====
function endSeason(world){
  const champs={};
  LEAGUES.forEach(L=>{champs[L.id]=tableOf(world,L.id)[0];});
  // Resolve every tournament for this season (domestic cups, super cups,
  // UCL/UEL/UECL/ACL, club world cup, and rotating international tournaments).
  const tour = (typeof resolveAllTournaments==='function') ? resolveAllTournaments(world) : null;
  // record history / palmares
  const entry={
    season:world.seasonLabel,
    leagues:Object.fromEntries(LEAGUES.map(L=>[L.name, champs[L.id]?champs[L.id].name:'-']))
  };
  if(tour){
    entry.domesticCups=Object.fromEntries(Object.values(tour.domesticCups).map(c=>[c.name,c.winner]));
    entry.contCups=Object.fromEntries(Object.values(tour.contCups).map(c=>[c.name,c.winner]));
    entry.superCups=Object.fromEntries(Object.values(tour.superCups).map(c=>[c.name,c.winner]));
    if(tour.clubWorldCup) entry.clubWorldCup={[tour.clubWorldCup.name]:tour.clubWorldCup.winner};
    if(tour.intl.length) entry.international=Object.fromEntries(tour.intl.map(t=>[t.name,t.winner]));
  }
  world.history.push(entry);
  world.lastTournaments=tour;
  // prize for my club by league position
  const my=world.clubs[world.myClub];
  const myTable=tableOf(world,my.league);
  const pos=myTable.findIndex(c=>c.id===world.myClub)+1;
  my.budget=+(my.budget+Math.max(2,(myTable.length-pos+1)*1.5)).toFixed(1);
  // age & regen
  Object.values(world.clubs).forEach(c=>{
    c.P=c.W=c.D=c.L=c.GF=c.GA=c.Pts=0;
    c.squad.forEach(p=>{p.age++;p.goals=0;p.apps=0;if(p.age>30)p.ovr=clamp2(p.ovr-irnd2(0,2),45,99);p.value=valueOf(p);});
    // retire very old, add youth
    c.squad=c.squad.filter(p=>p.age<37);
    while(c.squad.length<22){c.squad.push(genPlayer(pick2(POS),c.rating-irnd2(4,12),c.country));}
  });
  // advance season label (e.g. 25/26 -> 26/27)
  world.seasonLabel=nextLabel(world.seasonLabel);
  world.seasonNum++;
  LEAGUES.forEach(L=>{const ids=Object.values(world.clubs).filter(c=>c.league===L.id).map(c=>c.id);
    world.leagueFix[L.id]=fixtures(ids);world.leagueDay[L.id]=0;world.results[L.id]=[];});
  world.cont=null; world.market=buildMarket2();
  return {champs, contWinner, wc, pos};
}
function nextLabel(label){
  const m=/^(\d{2})\/(\d{2})$/.exec(label); if(!m) return label;
  const a=(+m[1]+1)%100, b=(+m[2]+1)%100;
  return String(a).padStart(2,'0')+'/'+String(b).padStart(2,'0');
}

// transfers
function buy2(world,mp){const c=world.clubs[world.myClub];if(c.budget<mp.askingPrice)return{ok:false,msg:'Dana kurang.'};
  c.budget=+(c.budget-mp.askingPrice).toFixed(1);const cp={...mp};delete cp.askingPrice;c.squad.push(cp);
  world.market=world.market.filter(p=>p.id!==mp.id);return{ok:true,msg:`${cp.name} bergabung.`};}
function sell2(world,id){const c=world.clubs[world.myClub];if(c.squad.length<=16)return{ok:false,msg:'Skuad minimal 16.'};
  const i=c.squad.findIndex(p=>p.id===id);if(i<0)return{ok:false,msg:'?'};const p=c.squad[i];
  const fee=+(p.value*rnd2(0.85,1.1)).toFixed(1);c.budget=+(c.budget+fee).toFixed(1);c.squad.splice(i,1);
  return{ok:true,msg:`${p.name} terjual ${fee} jt.`};}
function train2(p,attr){if(p[attr]>=99)return false;p[attr]=clamp2(p[attr]+irnd2(1,3),40,99);
  const w={GK:{defend:.5,pass:.2,pace:.1,stamina:.2,shoot:0},DEF:{defend:.5,pace:.2,pass:.15,stamina:.15,shoot:0},
    MID:{pass:.35,defend:.2,shoot:.2,pace:.15,stamina:.1},FWD:{shoot:.4,pace:.3,pass:.15,stamina:.1,defend:.05}}[p.pos];
  let v=0;for(const k in w)v+=p[k]*w[k];p.ovr=clamp2(Math.round(v),45,99);p.value=valueOf(p);return true;}

function saveWorld(w){localStorage.setItem(SAVE_KEY2,JSON.stringify({w,_wuid}));}
function loadWorld(){const r=localStorage.getItem(SAVE_KEY2);if(!r)return null;try{const d=JSON.parse(r);_wuid=d._wuid||10000;return d.w;}catch(e){return null;}}
function hasWorldSave(){return !!localStorage.getItem(SAVE_KEY2);}
