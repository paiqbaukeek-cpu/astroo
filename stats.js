// ===== Ultra Super Kick Off - Stats & Awards =====
// Pure helpers over the world state. No DOM. Uses world.clubs and engine2 helpers.

function allPlayers(world, leagueId){
  const out=[];
  Object.values(world.clubs).forEach(c=>{
    if(leagueId && c.league!==leagueId) return;
    c.squad.forEach(p=> out.push({p, club:c}));
  });
  return out;
}

// Top scorers; leagueId optional (null = whole world).
function topScorers(world, leagueId, limit=10){
  return allPlayers(world, leagueId)
    .filter(x=>x.p.goals>0)
    .sort((a,b)=> b.p.goals-a.p.goals || b.p.assists-a.p.assists)
    .slice(0,limit);
}
function topAssists(world, leagueId, limit=10){
  return allPlayers(world, leagueId)
    .filter(x=>(x.p.assists||0)>0)
    .sort((a,b)=> (b.p.assists||0)-(a.p.assists||0) || b.p.goals-a.p.goals)
    .slice(0,limit);
}
function topRated(world, leagueId, limit=10){
  return allPlayers(world, leagueId)
    .filter(x=>(x.p.apps||0)>=5)
    .sort((a,b)=> (b.p.rating||0)-(a.p.rating||0))
    .slice(0,limit);
}

// Compute individual awards for the season just played.
function computeAwards(world){
  const all=allPlayers(world,null);
  const played=all.filter(x=>(x.p.apps||0)>=5);
  if(!played.length) return null;

  // Golden Boot: most goals
  const boot=[...all].sort((a,b)=>b.p.goals-a.p.goals)[0];
  // Golden Glove: GK with most clean sheets
  const gks=all.filter(x=>x.p.pos==='GK');
  const glove=gks.sort((a,b)=>(b.p.cleanSheets||0)-(a.p.cleanSheets||0))[0];
  // Best Young Player: best rating among age<=21
  const young=played.filter(x=>x.p.age<=21).sort((a,b)=>award(b.p)-award(a.p))[0];
  // Ballon d'Or: best overall season score (rating + goals + assists weighted)
  const ballon=[...played].sort((a,b)=>award(b.p)-award(a.p))[0];

  const fmt=x=> x? `${x.p.name} (${x.club.name})` : '-';
  return {
    ballon: ballon? {name:ballon.p.name, club:ballon.club.name, g:ballon.p.goals, a:ballon.p.assists||0, r:ballon.p.rating||0}:null,
    goldenBoot: boot? {name:boot.p.name, club:boot.club.name, goals:boot.p.goals}:null,
    goldenGlove: glove? {name:glove.p.name, club:glove.club.name, cs:glove.p.cleanSheets||0}:null,
    youngPlayer: young? {name:young.p.name, club:young.club.name, age:young.p.age, r:young.p.rating||0}:null
  };
}
// season score used for Ballon d'Or & best young player ranking
function award(p){
  return (p.rating||0)*5 + p.goals*1.4 + (p.assists||0)*1.0 + (p.cleanSheets||0)*0.8;
}
