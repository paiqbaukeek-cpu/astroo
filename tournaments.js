// ===== Ultra Super Kick Off - Tournaments Module =====
// Adds the full real-life-style tournament set on top of engine2.js.
// Uses globals from engine2.js: simMatch, tableOf, LEAGUES, NATIONS, shuffle, irnd2, rnd2, pick2.
// All competitions resolve via single-elimination (penalties break ties).

// Continental cup definitions (Europe has 3 tiers like real life).
const EU_LEAGUES = ['eng1','esp1','ita1','ger1','fra1'];
const CONT_CUPS = [
  { id:'ucl',  name:'Liga Champonss Eropa',  pool:EU_LEAGUES,         from:0, to:4 },   // top 1-4
  { id:'uel',  name:'Liga Eropaa',           pool:EU_LEAGUES,         from:4, to:6 },   // 5-6
  { id:'uecl', name:'Konferens Eropaa',      pool:EU_LEAGUES,         from:6, to:8 },   // 7-8
  { id:'acl',  name:'Liga Champonss Asiaa',  pool:['idn1'],          from:0, to:6 },
  { id:'libe', name:'Copa Libertadoress',    pool:['bra1','arg1'],   from:0, to:6 },   // South America
  { id:'caf',  name:'Liga Champonss Afrikaa',pool:['caf1'],          from:0, to:8 },   // Africa
  { id:'conc', name:'Liga Champonss CONCACAFF',pool:['mex1'],        from:0, to:8 }    // North/Central America
];

// Domestic cup: all clubs in a league, knockout.
const DOMESTIC_CUPS = {
  eng1:'Piala FAA', esp1:'Copa del Reyy', ita1:'Coppa Italiaa',
  ger1:'DFB Pokall', fra1:'Coupe de Francee', idn1:'Piala Indonesa'
};

// International tournaments by confederation, run on a 4-season rotation (offset so they don't all clash).
const INTL_TOURNAMENTS = [
  { id:'wc',    name:'Piala Duniaa',     conf:'ALL', every:4, offset:0 },
  { id:'euro',  name:'Piala Eropaa',     conf:'EUR', every:4, offset:2 },
  { id:'copa',  name:'Copa Amerikaa',    conf:'SAM', every:4, offset:1 },
  { id:'asia',  name:'Piala Asiaa',      conf:'ASI', every:2, offset:1 },
  { id:'afcon', name:'Piala Afrikaa',    conf:'AFR', every:2, offset:0 },
  { id:'oro',   name:'Copa Oroo',        conf:'NAM', every:2, offset:0 }
];

function powerOfTwoPad(arr){
  arr=[...arr]; if(arr.length<2) return arr;
  let size=1; while(size<arr.length) size*=2;
  while(arr.length<size) arr.push(arr[Math.floor(Math.random()*arr.length)]);
  return arr;
}

// Generic club knockout. teamIds -> {winner, rounds:[{n,log}]}
function runClubKnockout(world, teamIds){
  let teams=powerOfTwoPad(shuffle(teamIds));
  const rounds=[];
  while(teams.length>1){
    const next=[],log=[];
    for(let i=0;i<teams.length;i+=2){
      const h=world.clubs[teams[i]], a=world.clubs[teams[i+1]];
      const r=simMatch(h,a,true);
      let hw=r.home,aw=r.away; if(hw===aw){Math.random()<0.5?hw++:aw++;}
      const win=hw>aw?h:a;
      log.push(`${h.name} ${r.home}-${r.away} ${a.name}${hw!==r.home||aw!==r.away?' (pen)':''} → ${win.name}`);
      next.push(win.id);
    }
    rounds.push({n:teams.length,log}); teams=next;
  }
  return {winner:teams[0], rounds};
}

// National knockout using nation ratings.
function runNationKnockout(world, codes){
  const teams=buildNationalTeams(world);
  let cur=powerOfTwoPad(shuffle(codes));
  if(cur.length<2) return {winner:cur[0]?teams[cur[0]].name:'-', rounds:[]};
  const rounds=[];
  while(cur.length>1){
    const next=[],log=[];
    for(let i=0;i<cur.length;i+=2){
      const A=teams[cur[i]],B=teams[cur[i+1]];
      const ar=A.rating+irnd2(-8,8),br=B.rating+irnd2(-8,8);
      const ga=Math.max(0,Math.round((ar-br)/15+rnd2(0,2))),gb=Math.max(0,Math.round((br-ar)/15+rnd2(0,2)));
      const win=ga>gb?A:gb>ga?B:(Math.random()<0.5?A:B);
      log.push(`${A.name} ${ga}-${gb} ${B.name} → ${win.name}`); next.push(win.id);
    }
    rounds.push({n:cur.length,log}); cur=next;
  }
  return {winner:teams[cur[0]].name, rounds};
}

// Resolve EVERY tournament for the current season. Returns a structured result object.
function resolveAllTournaments(world){
  const out={ domesticCups:{}, contCups:{}, superCups:{}, clubWorldCup:null, intl:[] };

  // 1) Domestic cups (all clubs per league)
  Object.keys(DOMESTIC_CUPS).forEach(lid=>{
    const ids=Object.values(world.clubs).filter(c=>c.league===lid).map(c=>c.id);
    const res=runClubKnockout(world, ids);
    out.domesticCups[lid]={name:DOMESTIC_CUPS[lid], winner:world.clubs[res.winner].name, winnerId:res.winner, rounds:res.rounds};
  });

  // 2) Continental cups (UCL / UEL / UECL / ACL) by league finishing positions
  CONT_CUPS.forEach(cup=>{
    const ids=[];
    cup.pool.forEach(lid=> tableOf(world,lid).slice(cup.from,cup.to).forEach(c=>ids.push(c.id)));
    if(ids.length<2) return;
    const res=runClubKnockout(world, ids);
    out.contCups[cup.id]={name:cup.name, winner:world.clubs[res.winner].name, winnerId:res.winner, rounds:res.rounds};
  });

  // 3) Domestic Super Cups (league champ vs domestic cup winner)
  LEAGUES.forEach(L=>{
    const champ=tableOf(world,L.id)[0];
    const cupW=out.domesticCups[L.id];
    if(!champ||!cupW) return;
    const h=champ, a=world.clubs[cupW.winnerId];
    if(h.id===a.id){ out.superCups[L.id]={name:'Piala Super '+L.country, winner:h.name}; return; }
    const r=simMatch(h,a,true); let hw=r.home,aw=r.away; if(hw===aw)Math.random()<0.5?hw++:aw++;
    out.superCups[L.id]={name:'Piala Super '+L.country, winner:(hw>aw?h:a).name};
  });

  // 4) Club World Cup (winners of each continental cup + top league champions)
  const cwcIds=[];
  ['ucl','uel','acl'].forEach(id=>{ if(out.contCups[id]) cwcIds.push(out.contCups[id].winnerId); });
  LEAGUES.forEach(L=>{ const champ=tableOf(world,L.id)[0]; if(champ) cwcIds.push(champ.id); });
  const uniq=[...new Set(cwcIds)];
  if(uniq.length>=2){ const res=runClubKnockout(world, uniq);
    out.clubWorldCup={name:'Piala Duniaa Antarklub', winner:world.clubs[res.winner].name, rounds:res.rounds}; }

  // 5) International tournaments on rotation
  INTL_TOURNAMENTS.forEach(t=>{
    if((world.seasonNum % t.every) !== (t.offset % t.every)) return;
    const codes = t.conf==='ALL' ? NATIONS.map(n=>n.code) : NATIONS.filter(n=>n.conf===t.conf).map(n=>n.code);
    if(codes.length<2) return;
    const res=runNationKnockout(world, codes);
    out.intl.push({id:t.id, name:t.name, winner:res.winner, rounds:res.rounds});
  });

  return out;
}
