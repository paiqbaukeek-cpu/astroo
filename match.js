// ===== Ultra Super Kick Off - Live Match Extras =====
// Adds richer match events (cards + VAR), friendlies and substitutions.
// Depends on engine2 globals: simMatch, startingXI, clamp2, irnd2, rnd2, pick2.

// Build a full timeline (goals + cards + VAR) from a simMatch result.
// Returns array of {m, type, team, text, var?} sorted by minute.
function buildTimeline(home, away, r){
  const ev=[];
  // goals (with possible VAR check)
  r.scorers.forEach(s=>{
    let text=`⚽ ${s.m}' GOL! ${s.name}` + (s.aname?` (assist: ${s.aname})`:'');
    const item={m:s.m, type:'goal', team:s.team, text, sid:s.sid};
    // 12% of goals get a VAR review; 1 in 4 of those is disallowed (offside/foul)
    if(Math.random()<0.12){
      if(Math.random()<0.25){ item.disallowed=true; item.var=`📺 VAR ${s.m}': Gol dianulir (offside).`; }
      else item.var=`📺 VAR ${s.m}': Gol disahkan.`;
    }
    ev.push(item);
  });
  // cards for both teams
  [home,away].forEach(team=>{
    const xi=startingXI(team);
    const yellow=irnd2(0,3), red=Math.random()<0.12?1:0;
    for(let i=0;i<yellow;i++){const p=pick2(xi);ev.push({m:irnd2(10,90),type:'yellow',team:team.id,text:`🟨 ${p?p.name:'Pemain'} kartu kuning`});}
    if(red){const p=pick2(xi);const m=irnd2(30,90);
      // some reds come from VAR review
      const viaVar=Math.random()<0.4;
      ev.push({m,type:'red',team:team.id,text:`🟹 ${p?p.name:'Pemain'} kartu merah`, var:viaVar?`📺 VAR ${m}': Kartu merah dikonfirmasi.`:null});
    }
  });
  // a possible penalty award via VAR (cosmetic - goal already counted in score)
  if(Math.random()<0.18){const t=Math.random()<0.5?home:away;const m=irnd2(20,88);
    ev.push({m,type:'var',team:t.id,text:`📺 VAR ${m}': Cek penalti untuk ${t.name}...`});}
  return ev.sort((a,b)=>a.m-b.m);
}

// Recompute final score after VAR-disallowed goals removed from the timeline.
function scoreFromTimeline(homeId, awayId, timeline){
  let h=0,a=0;
  timeline.forEach(e=>{ if(e.type==='goal' && !e.disallowed){ if(e.team===homeId)h++; else a++; } });
  return {home:h, away:a};
}

// Friendly match: does not affect league standings; gives a little morale/fitness.
// Returns {home,away,timeline}.
function playFriendly(world, oppId){
  const me=world.clubs[world.myClub];
  const opp=world.clubs[oppId];
  if(!opp) return null;
  const r=simMatch(me,opp,true);
  const timeline=buildTimeline(me,opp,r);
  const score=scoreFromTimeline(me.id,opp.id,timeline);
  // small morale bump for participants
  startingXI(me).forEach(p=>p.morale=clamp2(p.morale+1,40,99));
  world.friendliesUsed=(world.friendliesUsed||0)+1;
  return {homeId:me.id, awayId:opp.id, home:score.home, away:score.away, timeline, friendly:true,
          scorers:r.scorers.filter(s=>{return true;})};
}
const MAX_FRIENDLIES=5;
function friendliesLeft(world){return MAX_FRIENDLIES-(world.friendliesUsed||0);}

// Substitution during a (simulated) match view: swap a starter with a bench player.
// Limited to 5 subs per match (tracked on the match view object).
function makeSub(matchView, outId, inId){
  matchView.subs=matchView.subs||[];
  if(matchView.subs.length>=5) return {ok:false,msg:'Maksimal 5 pergantian.'};
  matchView.subs.push({outId,inId});
  return {ok:true,msg:'Pergantian dilakukan.'};
}
