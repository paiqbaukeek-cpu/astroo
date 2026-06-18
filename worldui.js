// ===== Ultra Super Kick Off - World UI =====
let W = null;
let wSelLeague = LEAGUES[0].id;
let wSelClub = null;

const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));
const E = (t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const M = v => (+v).toFixed(1)+' jt';
const NAT = code => (NATIONS.find(n=>n.code===code)||{name:code}).name;
const clubsOf = lid => Object.values(W.clubs).filter(c=>c.league===lid);
function myC(){return W.clubs[W.myClub];}

function show(id){qa('.screen').forEach(s=>s.classList.remove('active'));q('#'+id).classList.add('active');}

function toastW(msg){const t=E('div',null,msg);
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1f6feb;color:#fff;padding:10px 16px;border-radius:8px;z-index:50;box-shadow:0 4px 14px rgba(0,0,0,.4)';
  document.body.appendChild(t);setTimeout(()=>t.remove(),2800);}

// ---------- Start screen ----------
function buildLeagueSelect(){
  const sel=q('#w-league');sel.innerHTML='';
  LEAGUES.forEach(L=>{const o=E('option',null,L.name+' ('+NAT(L.country)+')');o.value=L.id;sel.appendChild(o);});
  sel.value=wSelLeague;
  sel.onchange=()=>{wSelLeague=sel.value;wSelClub=null;buildClubPicker();};
}
function buildClubPicker(){
  const grid=q('#w-club-picker');grid.innerHTML='';
  LEAGUES.find(L=>L.id===wSelLeague).clubs.forEach(def=>{
    const card=E('div','club-card',`<div class="nm">${def.name}</div><div class="meta">Rating ${def.rating}</div>`);
    card.onclick=()=>{wSelClub=def.name;qa('#w-club-picker .club-card').forEach(x=>x.classList.remove('selected'));card.classList.add('selected');};
    grid.appendChild(card);
  });
}

// ---------- HUD ----------
function hud(){
  if(!W){q('#hud').innerHTML='';return;}
  const c=myC(),lid=c.league,total=W.leagueFix[lid].length,day=W.leagueDay[lid];
  const L=LEAGUES.find(x=>x.id===lid);
  q('#hud').innerHTML=
    `<span>Manajer: <b>${W.manager}</b></span>`+
    `<span>Klub: <b>${c.name}</b></span>`+
    `<span>Liga: <b>${L.name}</b></span>`+
    `<span>Musim: <b>${W.seasonLabel}</b></span>`+
    `<span>Pekan: <b>${Math.min(day+1,total)}/${total}</b></span>`+
    `<span>Dana: <b>${M(c.budget)}</b></span>`;
}

// ---------- Tabs ----------
function tab(name){
  qa('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
  qa('.tabpane').forEach(p=>p.classList.remove('active'));
  q('#tab-'+name).classList.add('active');
  ({squad:tSquad,tactics:tTactics,training:tTraining,transfer:tTransfer,fixtures:tFixtures,table:tTable,tournaments:tTournaments,stats:tStats,history:tHistory})[name]();
}

const ORD={GK:0,DEF:1,MID:2,FWD:3};
function posTag(p){return `<span class="pos ${p}">${p}</span>`;}

// ---------- Squad ----------
function tSquad(){
  const c=myC(),pane=q('#tab-squad');pane.innerHTML='';
  pane.appendChild(E('p','muted',`Skuad ${c.name} · ${c.squad.length} pemain`));
  const t=E('table');
  t.innerHTML='<thead><tr><th>Pos</th><th>Nama</th><th>Negara</th><th>Umur</th><th>OVR</th><th>Gol</th><th>Nilai</th></tr></thead>';
  const tb=E('tbody');
  c.squad.slice().sort((a,b)=>ORD[a.pos]-ORD[b.pos]||b.ovr-a.ovr).forEach(p=>{
    tb.appendChild(E('tr',null,`<td>${posTag(p.pos)}</td><td>${p.name}</td><td>${NAT(p.nat)}</td><td>${p.age}</td><td><b>${p.ovr}</b></td><td>${p.goals}</td><td>${M(p.value)}</td>`));
  });
  t.appendChild(tb);pane.appendChild(t);
}

// ---------- Tactics ----------
function tTactics(){
  const c=myC(),pane=q('#tab-tactics');pane.innerHTML='';
  const s=clubStrength(c);
  const box=E('div','panel','<h3>Kekuatan Tim</h3>');
  box.appendChild(E('div','row',
    `<span class="pill">Serangan: <b>${s.attack.toFixed(1)}</b></span>`+
    `<span class="pill">Pertahanan: <b>${s.defense.toFixed(1)}</b></span>`+
    `<span class="pill">Kekuatan: <b>${s.overall.toFixed(1)}</b></span>`));
  pane.appendChild(box);
  const xi=E('div','panel','<h3>Starting XI (otomatis: 4-4-2 terbaik)</h3>');
  startingXI(c).sort((a,b)=>ORD[a.pos]-ORD[b.pos]).forEach(p=>xi.appendChild(E('div','pill',`${posTag(p.pos)} ${p.name} (${p.ovr})`)));
  pane.appendChild(xi);
}

// ---------- Training ----------
function tTraining(){
  const c=myC(),pane=q('#tab-training');pane.innerHTML='';
  pane.appendChild(E('p','muted','Latih atribut pemain (+1..+3). OVR & nilai ikut naik.'));
  const t=E('table');
  t.innerHTML='<thead><tr><th>Nama</th><th>Pos</th><th>OVR</th><th>Pace</th><th>Shoot</th><th>Pass</th><th>Defend</th><th></th></tr></thead>';
  const tb=E('tbody');
  c.squad.slice().sort((a,b)=>b.ovr-a.ovr).forEach(p=>{
    const tr=E('tr',null,`<td>${p.name}</td><td>${posTag(p.pos)}</td><td><b>${p.ovr}</b></td><td>${p.pace}</td><td>${p.shoot}</td><td>${p.pass}</td><td>${p.defend}</td>`+
      `<td><select data-a><option value="pace">Pace</option><option value="shoot">Shoot</option><option value="pass">Pass</option><option value="defend">Defend</option><option value="stamina">Stamina</option></select> <button class="btn small" data-go>Go</button></td>`);
    tr.querySelector('[data-go]').onclick=()=>{if(train2(p,tr.querySelector('[data-a]').value)){tTraining();hud();}};
    tb.appendChild(tr);
  });
  t.appendChild(tb);pane.appendChild(t);
}

// ---------- Transfer ----------
function tTransfer(){
  const c=myC(),pane=q('#tab-transfer');pane.innerHTML='';
  pane.appendChild(E('p','muted',`Dana: <b>${M(c.budget)}</b>`));
  const grid=E('div','grid2');
  const buy=E('div','panel','<h3>Bursa Transfer</h3>');
  const bt=E('table');bt.innerHTML='<thead><tr><th>Pos</th><th>Nama</th><th>Neg</th><th>OVR</th><th>Harga</th><th></th></tr></thead>';
  const btb=E('tbody');
  W.market.slice().sort((a,b)=>b.ovr-a.ovr).forEach(p=>{
    const tr=E('tr',null,`<td>${posTag(p.pos)}</td><td>${p.name}</td><td>${NAT(p.nat)}</td><td><b>${p.ovr}</b></td><td>${M(p.askingPrice)}</td>`);
    const cell=E('td');const b=E('button','btn small primary','Beli');b.disabled=c.budget<p.askingPrice;
    b.onclick=()=>{const r=buy2(W,p);toastW(r.msg);tTransfer();hud();};cell.appendChild(b);tr.appendChild(cell);btb.appendChild(tr);
  });
  bt.appendChild(btb);buy.appendChild(bt);
  const sell=E('div','panel','<h3>Jual Pemain</h3>');
  const st=E('table');st.innerHTML='<thead><tr><th>Pos</th><th>Nama</th><th>OVR</th><th>Nilai</th><th></th></tr></thead>';
  const stb=E('tbody');
  c.squad.slice().sort((a,b)=>a.ovr-b.ovr).forEach(p=>{
    const tr=E('tr',null,`<td>${posTag(p.pos)}</td><td>${p.name}</td><td>${p.ovr}</td><td>${M(p.value)}</td>`);
    const cell=E('td');const b=E('button','btn small','Jual');
    b.onclick=()=>{const r=sell2(W,p.id);toastW(r.msg);tTransfer();hud();};cell.appendChild(b);tr.appendChild(cell);stb.appendChild(tr);
  });
  st.appendChild(stb);sell.appendChild(st);
  grid.appendChild(buy);grid.appendChild(sell);pane.appendChild(grid);
}

// ---------- Fixtures (my league) ----------
function tFixtures(){
  const c=myC(),lid=c.league,pane=q('#tab-fixtures');pane.innerHTML='';
  W.leagueFix[lid].forEach((round,i)=>{
    const played=i<W.leagueDay[lid];
    const box=E('div','panel',`<h3>Pekan ${i+1} ${i===W.leagueDay[lid]?'<span class="pill">Berikutnya</span>':''}</h3>`);
    round.forEach(([h,a])=>{
      const H=W.clubs[h],A=W.clubs[a];let res='vs';
      if(played){const dr=W.results[lid][i].find(r=>r.homeId===h&&r.awayId===a);if(dr)res=`<b>${dr.home} - ${dr.away}</b>`;}
      const mine=(h===W.myClub||a===W.myClub)?'pill me':'pill';
      box.appendChild(E('div',mine,`${H.name} ${res} ${A.name}`));
    });
    pane.appendChild(box);
  });
}

// ---------- Table (selectable league) ----------
function tTable(){
  const pane=q('#tab-table');pane.innerHTML='';
  const sel=E('select');LEAGUES.forEach(L=>{const o=E('option',null,L.name);o.value=L.id;if(L.id===(tTable._sel||myC().league))o.selected=true;sel.appendChild(o);});
  sel.onchange=()=>{tTable._sel=sel.value;tTable();};pane.appendChild(sel);
  const lid=tTable._sel||myC().league;
  const t=E('table');
  t.innerHTML='<thead><tr><th>#</th><th>Klub</th><th>M</th><th>M</th><th>S</th><th>K</th><th>GM</th><th>GK</th><th>SG</th><th>Poin</th></tr></thead>';
  const tb=E('tbody');
  tableOf(W,lid).forEach((c,i)=>{
    tb.appendChild(E('tr',c.id===W.myClub?'me':'',`<td>${i+1}</td><td>${c.name}</td><td>${c.P}</td><td>${c.W}</td><td>${c.D}</td><td>${c.L}</td><td>${c.GF}</td><td>${c.GA}</td><td>${c.GF-c.GA}</td><td><b>${c.Pts}</b></td>`));
  });
  t.appendChild(tb);pane.appendChild(t);
}

// ---------- Tournaments (last season results) ----------
function tTournaments(){
  const pane=q('#tab-tournaments');pane.innerHTML='';
  const tr=W.lastTournaments;
  if(!tr){pane.appendChild(E('p','muted','Selesaikan satu musim penuh untuk melihat hasil seluruh turnamen (piala domestik, super cup, UCL/UEL/UECL, Piala Dunia Antarklub, dan turnamen antarnegara).'));return;}
  const sec=(title,rows)=>{const b=E('div','panel',`<h3>${title}</h3>`);rows.forEach(r=>b.appendChild(E('div','pill',r)));pane.appendChild(b);};
  sec('Piala Kontinental', Object.values(tr.contCups).map(c=>`${c.name}: <b>${c.winner}</b>`));
  sec('Piala Domestik', Object.values(tr.domesticCups).map(c=>`${c.name}: <b>${c.winner}</b>`));
  sec('Piala Super', Object.values(tr.superCups).map(c=>`${c.name}: <b>${c.winner}</b>`));
  if(tr.clubWorldCup) sec('Antarklub Dunia', [`${tr.clubWorldCup.name}: <b>${tr.clubWorldCup.winner}</b>`]);
  if(tr.intl.length) sec('Antarnegara', tr.intl.map(t=>`${t.name}: <b>${t.winner}</b>`));
}

// ---------- Statistik ----------
function tStats(){
  const pane=q('#tab-stats');pane.innerHTML='';
  const sel=E('select');
  const optAll=E('option',null,'Semua Liga (Dunia)');optAll.value='';sel.appendChild(optAll);
  LEAGUES.forEach(L=>{const o=E('option',null,L.name);o.value=L.id;if(L.id===tStats._sel)o.selected=true;sel.appendChild(o);});
  sel.value=tStats._sel||'';
  sel.onchange=()=>{tStats._sel=sel.value;tStats();};
  pane.appendChild(sel);
  const lid=tStats._sel||null;
  const grid=E('div','grid2');
  grid.appendChild(statTable('⚽ Top Skor', topScorers(W,lid,12), x=>x.p.goals, 'Gol'));
  grid.appendChild(statTable('🎯 Top Assist', topAssists(W,lid,12), x=>x.p.assists||0, 'Assist'));
  pane.appendChild(grid);
  const grid2=E('div','grid2');
  grid2.appendChild(statTable('⭐ Rating Tertinggi', topRated(W,lid,12), x=>x.p.rating||0, 'Rating'));
  grid2.appendChild(statTable('🧤 Clean Sheet (GK)', topRated(W,lid,30).filter(x=>x.p.pos==='GK').slice(0,12), x=>x.p.cleanSheets||0, 'CS'));
  pane.appendChild(grid2);
}
function statTable(title, list, valFn, valLabel){
  const box=E('div','panel',`<h3>${title}</h3>`);
  if(!list.length){box.appendChild(E('p','muted','Belum ada data. Mainkan beberapa pekan.'));return box;}
  const t=E('table');
  t.innerHTML=`<thead><tr><th>#</th><th>Pemain</th><th>Klub</th><th>${valLabel}</th></tr></thead>`;
  const tb=E('tbody');
  list.forEach((x,i)=>tb.appendChild(E('tr',x.club.id===W.myClub?'me':'',`<td>${i+1}</td><td>${x.p.name}</td><td>${x.club.name}</td><td><b>${valFn(x)}</b></td>`)));
  t.appendChild(tb);box.appendChild(t);return box;
}

// ---------- History / Palmares ----------
function tHistory(){
  const pane=q('#tab-history');pane.innerHTML='';
  if(!W.history.length){pane.appendChild(E('p','muted','Belum ada sejarah. Mainkan minimal satu musim penuh.'));return;}
  W.history.slice().reverse().forEach(h=>{
    const box=E('div','panel',`<h3>Musim ${h.season}</h3>`);
    Object.entries(h.leagues).forEach(([k,v])=>box.appendChild(E('div','pill',`Juara ${k}: <b>${v}</b>`)));
    if(h.contCups)Object.entries(h.contCups).forEach(([k,v])=>box.appendChild(E('div','pill',`${k}: <b>${v}</b>`)));
    if(h.clubWorldCup)Object.entries(h.clubWorldCup).forEach(([k,v])=>box.appendChild(E('div','pill',`${k}: <b>${v}</b>`)));
    if(h.international)Object.entries(h.international).forEach(([k,v])=>box.appendChild(E('div','pill',`🏆 ${k}: <b>${v}</b>`)));
    if(h.awards){const aw=h.awards;
      if(aw.ballon)box.appendChild(E('div','pill',`🏅 Ballon d'Orr: <b>${aw.ballon.name}</b> (${aw.ballon.club})`));
      if(aw.goldenBoot)box.appendChild(E('div','pill',`👟 Sepatu Emass: <b>${aw.goldenBoot.name}</b> · ${aw.goldenBoot.goals} gol`));
      if(aw.goldenGlove)box.appendChild(E('div','pill',`🧤 Sarung Emass: <b>${aw.goldenGlove.name}</b> · ${aw.goldenGlove.cs} CS`));
      if(aw.youngPlayer)box.appendChild(E('div','pill',`🌟 Pemain Muda Terbaikk: <b>${aw.youngPlayer.name}</b> (${aw.youngPlayer.age})`));
    }
    pane.appendChild(box);
  });
}

// ---------- Match ----------
function playWeek(){
  const c=myC(),lid=c.league;
  if(W.leagueDay[lid]>=W.leagueFix[lid].length){
    const sum=endSeason(W);
    toastW(`Musim selesai! Kamu finis peringkat ${sum.pos}. Cek tab Turnamen & Sejarah. Musim ${W.seasonLabel} dimulai.`);
    refresh();return;
  }
  const out=playWorldMatchday(W);
  if(out.myMatch) matchModal(out.myMatch); else { refresh(); }
}
function matchModal(m){
  const modal=q('#match-modal');modal.classList.remove('hidden');
  const h=W.clubs[m.homeId],a=W.clubs[m.awayId];
  q('#match-title').textContent=`${h.name} vs ${a.name}`;
  const sc=q('#match-score'),log=q('#match-log'),close=q('#match-close');
  sc.textContent='0 - 0';log.innerHTML='';close.classList.add('hidden');
  let hg=0,ag=0,i=0;const ev=m.scorers.slice();
  const timer=setInterval(()=>{
    if(i>=ev.length){clearInterval(timer);log.appendChild(E('div',null,`<b>Peluit panjang!</b> ${m.home} - ${m.away}`));close.classList.remove('hidden');log.scrollTop=log.scrollHeight;return;}
    const e=ev[i++];if(e.team===m.homeId)hg++;else ag++;sc.textContent=`${hg} - ${ag}`;
    const mine=e.team===W.myClub;
    log.appendChild(E('div',mine?'goal me':'goal',`⚽ ${e.m}' GOL! ${e.name}`));log.scrollTop=log.scrollHeight;
  },320);
  close.onclick=()=>{modal.classList.add('hidden');refresh();};
}

function refresh(){hud();const a=q('.tab.active');tab(a?a.dataset.tab:'squad');}
function enter(){show('screen-game');refresh();}

// ---------- bootstrap ----------
window.addEventListener('DOMContentLoaded',()=>{
  buildLeagueSelect();buildClubPicker();
  q('#w-load').disabled=!hasWorldSave();
  q('#w-start').onclick=()=>{
    if(!wSelClub){toastW('Pilih klub dulu.');return;}
    const name=q('#w-manager').value.trim()||'Manajer';
    const label=q('#w-season').value.trim()||'25/26';
    const tmp=newWorld(name,null,label);
    const target=Object.values(tmp.clubs).find(c=>c.league===wSelLeague&&c.name===wSelClub);
    tmp.myClub=target.id;W=tmp;enter();
  };
  q('#w-load').onclick=()=>{const s=loadWorld();if(s){W=s;enter();}else toastW('Tidak ada simpanan.');};
  qa('.tab').forEach(t=>t.onclick=()=>tab(t.dataset.tab));
  q('#w-play').onclick=playWeek;
  q('#w-save').onclick=()=>{saveWorld(W);toastW('Permainan disimpan.');};
  q('#w-quit').onclick=()=>{if(confirm('Keluar ke menu utama?')){W=null;hud();show('screen-start');q('#w-load').disabled=!hasWorldSave();}};
});
