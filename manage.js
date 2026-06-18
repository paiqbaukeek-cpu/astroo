// ===== Ultra Super Kick Off - Management Module =====
// Loans, retirements, and changing which club you manage.
// Depends on engine2 globals: world.clubs, irnd2, rnd2, pick2, valueOf, wageOf, tableOf, autoless helpers.

// ----- Loans -----
// Loan a player IN from another club for one season (cheap, returns next season).
function loanList(world){
  // pool of loanable players: squad players of other clubs with decent ovr, not their best XI
  const out=[];
  Object.values(world.clubs).forEach(c=>{
    if(c.id===world.myClub) return;
    c.squad.slice().sort((a,b)=>b.ovr-a.ovr).slice(6).forEach(p=>{
      if(p.ovr>=62 && p.ovr<=84 && !p.loanedFrom){
        out.push({club:c, p, fee:+(p.value*0.12+0.3).toFixed(1)});
      }
    });
  });
  return out.sort((a,b)=>b.p.ovr-a.p.ovr).slice(0,18);
}
function loanIn(world, fromClubId, playerId){
  const me=world.clubs[world.myClub];
  const from=world.clubs[fromClubId];
  if(!from) return {ok:false,msg:'Klub tidak ditemukan.'};
  const idx=from.squad.findIndex(p=>p.id===playerId);
  if(idx<0) return {ok:false,msg:'Pemain tidak ada.'};
  const p=from.squad[idx];
  const fee=+(p.value*0.12+0.3).toFixed(1);
  if(me.budget<fee) return {ok:false,msg:'Dana tidak cukup untuk biaya pinjam.'};
  me.budget=+(me.budget-fee).toFixed(1);
  from.squad.splice(idx,1);
  p.loanedFrom=fromClubId; p.loanSeason=world.seasonNum;
  me.squad.push(p);
  return {ok:true,msg:`${p.name} dipinjam dari ${from.name} (musim ini).`};
}
// At season end: return loaned players to their parent clubs.
function returnLoans(world){
  Object.values(world.clubs).forEach(c=>{
    for(let i=c.squad.length-1;i>=0;i--){
      const p=c.squad[i];
      if(p.loanedFrom){
        const parent=world.clubs[p.loanedFrom];
        c.squad.splice(i,1);
        if(parent){ delete p.loanedFrom; delete p.loanSeason; parent.squad.push(p); }
      }
    }
  });
}

// ----- Retirement -----
function retirePlayer(world, playerId){
  const me=world.clubs[world.myClub];
  if(me.squad.length<=16) return {ok:false,msg:'Skuad minimal 16 pemain.'};
  const idx=me.squad.findIndex(p=>p.id===playerId);
  if(idx<0) return {ok:false,msg:'Pemain tidak ada.'};
  const p=me.squad[idx];
  me.squad.splice(idx,1);
  return {ok:true,msg:`${p.name} resmi pensiun. Terima kasih atas pengabdiannya.`};
}
// Auto-retire very old players across the world (called at season end).
function autoRetire(world){
  Object.values(world.clubs).forEach(c=>{
    c.squad=c.squad.filter(p=> p.age<38 && !(p.age>=35 && Math.random()<0.4));
  });
}

// ----- Manager career: change club -----
// Generate job offers from clubs (better offers if you performed well).
function jobOffers(world){
  const me=world.clubs[world.myClub];
  const table=tableOf(world, me.league);
  const pos=table.findIndex(c=>c.id===me.id)+1;
  const performance = pos<=3 ? 'great' : pos<=8 ? 'ok' : 'poor';
  // offer pool: clubs with higher or similar rating depending on performance
  const pool=Object.values(world.clubs).filter(c=>c.id!==me.id);
  let candidates;
  if(performance==='great') candidates=pool.filter(c=>c.rating>=me.rating);
  else if(performance==='ok') candidates=pool.filter(c=>Math.abs(c.rating-me.rating)<=4);
  else candidates=pool.filter(c=>c.rating<=me.rating);
  candidates=candidates.sort((a,b)=>b.rating-a.rating);
  // return up to 5 distinct offers
  const offers=[]; const seen=new Set();
  for(const c of candidates){ if(offers.length>=5)break; if(seen.has(c.id))continue; seen.add(c.id); offers.push(c.id); }
  return {performance, pos, offers};
}
function acceptJob(world, clubId){
  if(!world.clubs[clubId]) return {ok:false,msg:'Klub tidak ada.'};
  world.myClub=clubId;
  return {ok:true,msg:`Kamu kini melatih ${world.clubs[clubId].name}.`};
}
function resignToClub(world, clubId){ return acceptJob(world, clubId); }
