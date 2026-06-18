// ===== Ultra Super Kick Off - Finance & Stadium =====
// Pure helpers over world state. Money unit = millions (jt). No DOM.

function totalWages(club){ return +club.squad.reduce((s,p)=>s+(p.wage||0),0).toFixed(1); }

// Season ticket income scales with stadium capacity and club rating (fill rate).
function ticketIncome(club){
  const fill = clamp2(0.5 + (club.rating-65)/60, 0.4, 0.98);
  const perSeat = 0.00006; // millions per attended seat-season
  return +(club.stadium.capacity * fill * perSeat * 19).toFixed(1); // ~19 home games
}

// Sponsor offers: pick by club rating. Each has a base payment + bonus if season target met.
function sponsorOffers(club){
  const r=club.rating;
  return [
    { id:'safe',   name:'StabilCorp',  base:+(r*0.10).toFixed(1), bonus:+(r*0.05).toFixed(1), target:'top10', label:'Finis 10 besar' },
    { id:'mid',    name:'MegaFinanz',  base:+(r*0.14).toFixed(1), bonus:+(r*0.12).toFixed(1), target:'top4',  label:'Finis 4 besar' },
    { id:'risk',   name:'UltraBrand',  base:+(r*0.08).toFixed(1), bonus:+(r*0.30).toFixed(1), target:'champion', label:'Juara liga' }
  ];
}
function signSponsor(club, offerId){
  const off=sponsorOffers(club).find(o=>o.id===offerId);
  if(!off) return false;
  club.sponsor={...off};
  return true;
}
function sponsorPayout(world, club){
  if(!club.sponsor) return 0;
  const s=club.sponsor;
  let pay=s.base;
  const table=tableOf(world, club.league);
  const pos=table.findIndex(c=>c.id===club.id)+1;
  const met = s.target==='top10'? pos<=10 : s.target==='top4'? pos<=4 : pos===1;
  if(met) pay+=s.bonus;
  return +pay.toFixed(1);
}

// Stadium expansion: cost grows with level; adds capacity.
function expansionCost(club){ return +(8 + club.stadium.level*6).toFixed(1); }
function expandStadium(club){
  const cost=expansionCost(club);
  if(club.budget<cost) return {ok:false,msg:'Dana tidak cukup untuk ekspansi.'};
  club.budget=+(club.budget-cost).toFixed(1);
  club.stadium.level++;
  club.stadium.capacity+=8000;
  return {ok:true,msg:`Stadion diperluas ke kapasitas ${club.stadium.capacity.toLocaleString()}.`};
}

// Contract negotiation: extend a player's contract; higher demand if good form/ovr.
function renewContract(club, player, years){
  years=clamp2(years||2,1,5);
  const demand=+(player.wage*(1+ (player.ovr-70)/100 + 0.05*years)).toFixed(1);
  player.wage=Math.max(player.wage, demand);
  player.contract=(player.contract||1)+years;
  player.morale=clamp2(player.morale+5,40,99);
  return {ok:true, msg:`${player.name} perpanjang ${years} musim. Gaji baru ${player.wage} jt/musim.`, newWage:player.wage};
}

// Apply end-of-season finances for ALL clubs: + ticket + sponsor - wages.
function applySeasonFinances(world){
  Object.values(world.clubs).forEach(c=>{
    const income = ticketIncome(c) + sponsorPayout(world, c);
    const wages = totalWages(c);
    c.budget = +(c.budget + income - wages).toFixed(1);
    // expiring contracts tick down; CPU clubs auto-renew key players
    c.squad.forEach(p=>{ p.contract=(p.contract||1)-1; if(p.contract<=0){ p.contract=irnd2(1,3); } });
  });
}
// Snapshot for UI: income/expense breakdown for a club this season.
function financeSummary(world, club){
  return {
    tickets: ticketIncome(club),
    sponsor: sponsorPayout(world, club),
    wages: totalWages(club),
    net: +(ticketIncome(club)+sponsorPayout(world,club)-totalWages(club)).toFixed(1)
  };
}
