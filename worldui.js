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
  ({squad:tSquad,tactics:tTactics,training:tTraining,transfer:tTransfer,finance:tFinance,manage:tManage,fixtures:tFixtures,table:tTable,tournaments:tTournaments,stats:tStats,history:tHistory,coach:tCoach})[name]();
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

// ---------- Keuangan ----------
function tFinance(){
  const c=myC(),pane=q('#tab-finance');pane.innerHTML='';
  const fs=financeSummary(W,c);
  const box=E('div','panel','<h3>Ringkasan Keuangan (proyeksi musim)</h3>');
  box.appendChild(E('div','row',
    `<span class="pill">Dana: <b>${M(c.budget)}</b></span>`+
    `<span class="pill">Tiket: <b>${M(fs.tickets)}</b></span>`+
    `<span class="pill">Sponsor: <b>${M(fs.sponsor)}</b></span>`+
    `<span class="pill">Gaji: <b class="tag-loss">-${M(fs.wages)}</b></span>`+
    `<span class="pill">Net: <b class="${fs.net>=0?'tag-win':'tag-loss'}">${fs.net>=0?'+':''}${M(fs.net)}</b></span>`));
  pane.appendChild(box);

  // Stadium
  const st=E('div','panel','<h3>🏟️ Stadion</h3>');
  st.appendChild(E('div','row',
    `<span class="pill">${c.stadium.name}</span>`+
    `<span class="pill">Kapasitas: <b>${c.stadium.capacity.toLocaleString()}</b></span>`+
    `<span class="pill">Level: <b>${c.stadium.level}</b></span>`));
  const ec=expansionCost(c);
  const eb=E('button','btn primary',`Perluas (+8.000 kursi) · ${M(ec)}`);
  eb.disabled=c.budget<ec;
  eb.onclick=()=>{const r=expandStadium(c);toastW(r.msg);tFinance();hud();};
  st.appendChild(eb);pane.appendChild(st);

  // Sponsor
  const sp=E('div','panel','<h3>🤝 Sponsor</h3>');
  sp.appendChild(E('p','muted', c.sponsor?`Sponsor aktif: <b>${c.sponsor.name}</b> · base ${M(c.sponsor.base)} + bonus ${M(c.sponsor.bonus)} jika ${c.sponsor.label}.`:'Belum ada sponsor. Pilih satu:'));
  sponsorOffers(c).forEach(o=>{
    const row=E('div','pill',`${o.name}: base <b>${M(o.base)}</b> + bonus <b>${M(o.bonus)}</b> (${o.label}) `);
    const b=E('button','btn small',c.sponsor&&c.sponsor.id===o.id?'Aktif':'Pilih');
    b.disabled=c.sponsor&&c.sponsor.id===o.id;
    b.onclick=()=>{signSponsor(c,o.id);toastW('Sponsor '+o.name+' ditandatangani.');tFinance();};
    row.appendChild(b);sp.appendChild(row);
  });
  pane.appendChild(sp);

  // Contracts
  const cn=E('div','panel','<h3>📝 Kontrak & Gaji</h3>');
  const t=E('table');
  t.innerHTML='<thead><tr><th>Nama</th><th>Pos</th><th>OVR</th><th>Gaji/musim</th><th>Sisa</th><th></th></tr></thead>';
  const tb=E('tbody');
  c.squad.slice().sort((a,b)=>b.ovr-a.ovr).forEach(p=>{
    const exp=(p.contract||0)<=1;
    const tr=E('tr',exp?'starter':'',`<td>${p.name}</td><td>${posTag(p.pos)}</td><td>${p.ovr}</td><td>${M(p.wage)}</td><td>${p.contract||0} msm</td>`);
    const cell=E('td');const b=E('button','btn small','Perpanjang +2');
    b.onclick=()=>{const r=renewContract(c,p,2);toastW(r.msg);tFinance();hud();};
    cell.appendChild(b);tr.appendChild(cell);tb.appendChild(tr);
  });
  t.appendChild(tb);cn.appendChild(t);pane.appendChild(cn);
}

// ---------- Manajemen ----------
function tManage(){
  const c=myC(),pane=q('#tab-manage');pane.innerHTML='';

  // Loan market
  const loan=E('div','panel','<h3>🔄 Pinjam Pemain (1 musim)</h3>');
  loan.appendChild(E('p','muted','Pemain pinjaman kembali ke klub asal di akhir musim.'));
  const lt=E('table');
  lt.innerHTML='<thead><tr><th>Pos</th><th>Nama</th><th>OVR</th><th>Klub Asal</th><th>Biaya</th><th></th></tr></thead>';
  const ltb=E('tbody');
  loanList(W).forEach(x=>{
    const tr=E('tr',null,`<td>${posTag(x.p.pos)}</td><td>${x.p.name}</td><td><b>${x.p.ovr}</b></td><td>${x.club.name}</td><td>${M(x.fee)}</td>`);
    const cell=E('td');const b=E('button','btn small primary','Pinjam');b.disabled=c.budget<x.fee;
    b.onclick=()=>{const r=loanIn(W,x.club.id,x.p.id);toastW(r.msg);tManage();hud();};
    cell.appendChild(b);tr.appendChild(cell);ltb.appendChild(tr);
  });
  lt.appendChild(ltb);loan.appendChild(lt);pane.appendChild(loan);

  // Retire
  const ret=E('div','panel','<h3>👋 Pensiunkan Pemain</h3>');
  const rt=E('table');
  rt.innerHTML='<thead><tr><th>Nama</th><th>Pos</th><th>Umur</th><th>OVR</th><th></th></tr></thead>';
  const rtb=E('tbody');
  c.squad.slice().sort((a,b)=>b.age-a.age).forEach(p=>{
    const tr=E('tr',null,`<td>${p.name}</td><td>${posTag(p.pos)}</td><td>${p.age}</td><td>${p.ovr}</td>`);
    const cell=E('td');const b=E('button','btn small danger','Pensiun');
    b.onclick=()=>{if(confirm(`Pensiunkan ${p.name}?`)){const r=retirePlayer(W,p.id);toastW(r.msg);tManage();hud();}};
    cell.appendChild(b);tr.appendChild(cell);rtb.appendChild(tr);
  });
  rt.appendChild(rtb);ret.appendChild(rt);pane.appendChild(ret);

  // Job offers
  const job=E('div','panel','<h3>💼 Tawaran Melatih Klub Lain</h3>');
  const jo=jobOffers(W);
  const perfTxt={great:'Sangat baik',ok:'Cukup',poor:'Kurang'}[jo.performance];
  job.appendChild(E('p','muted',`Performa kamu: <b>${perfTxt}</b> (peringkat ${jo.pos}). Tawaran tergantung performa.`));
  if(!jo.offers.length){ job.appendChild(E('p','muted','Belum ada tawaran. Tingkatkan performa.')); }
  jo.offers.forEach(id=>{
    const cl=W.clubs[id];
    const row=E('div','pill',`${cl.name} · Rating ${cl.rating} (${NAT(cl.country)}) `);
    const b=E('button','btn small','Terima & Pindah');
    b.onclick=()=>{if(confirm(`Pindah melatih ${cl.name}? Kamu meninggalkan ${c.name}.`)){const r=acceptJob(W,id);toastW(r.msg);refresh();}};
    row.appendChild(b);job.appendChild(row);
  });
  pane.appendChild(job);
}

// ---------- Fixtures (my league) ----------
function tFixtures(){
  const c=myC(),lid=c.league,pane=q('#tab-fixtures');pane.innerHTML='';
  // Friendly match panel
  const fr=E('div','panel',`<h3>🤝 Laga Persahabatan</h3>`);
  const left=(typeof friendliesLeft==='function')?friendliesLeft(W):0;
  fr.appendChild(E('p','muted',`Sisa friendly musim ini: <b>${left}</b> / ${MAX_FRIENDLIES}`));
  const sel=E('select');
  Object.values(W.clubs).filter(x=>x.id!==W.myClub).sort((a,b)=>a.name.localeCompare(b.name))
    .forEach(x=>{const o=E('option',null,`${x.name} (${NAT(x.country)})`);o.value=x.id;sel.appendChild(o);});
  fr.appendChild(sel);
  const fb=E('button','btn primary small','Main Friendly');
  fb.disabled=left<=0;
  fb.onclick=()=>{const out=playFriendly(W,sel.value);if(out){matchModal(out);}};
  fr.appendChild(fb);
  pane.appendChild(fr);
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
      if(aw.ballon)box.appendChild(E('div','pill',`🏅 Ballon d'Or: <b>${aw.ballon.name}</b> (${aw.ballon.club})`));
      if(aw.goldenBoot)box.appendChild(E('div','pill',`👟 Sepatu Emas: <b>${aw.goldenBoot.name}</b> · ${aw.goldenBoot.goals} gol`));
      if(aw.goldenGlove)box.appendChild(E('div','pill',`🧤 Sarung Emas: <b>${aw.goldenGlove.name}</b> · ${aw.goldenGlove.cs} CS`));
      if(aw.youngPlayer)box.appendChild(E('div','pill',`🌟 Pemain Muda Terbaik: <b>${aw.youngPlayer.name}</b> (${aw.youngPlayer.age})`));
    }
    pane.appendChild(box);
  });
}

// ---------- Profil Pelatih ----------
function tCoach(){
  const pane=q('#tab-coach');pane.innerHTML='';
  const cc=(typeof ensureCoach==='function')?ensureCoach(W):null;
  if(!cc){pane.appendChild(E('p','muted','Profil pelatih belum tersedia.'));return;}
  const c=myC();
  const box=E('div','panel','<h3>👤 Profil Pelatih</h3>');
  box.appendChild(E('div','row',
    `<span class="pill">Nama: <b>${cc.name}</b></span>`+
    `<span class="pill">Klub: <b>${c.name}</b></span>`+
    `<span class="pill">Mulai: <b>${cc.startedSeason}</b></span>`));
  pane.appendChild(box);

  const rec=E('div','panel','<h3>📊 Statistik Karir</h3>');
  const tot=cc.W+cc.D+cc.L;
  rec.appendChild(E('div','row',
    `<span class="pill">Main: <b>${tot}</b></span>`+
    `<span class="pill tag-win">Menang: <b>${cc.W}</b></span>`+
    `<span class="pill">Seri: <b>${cc.D}</b></span>`+
    `<span class="pill tag-loss">Kalah: <b>${cc.L}</b></span>`+
    `<span class="pill">Win%: <b>${coachWinPct(cc)}%</b></span>`+
    `<span class="pill">🏆 Trofi: <b>${cc.trophies}</b></span>`));
  pane.appendChild(rec);

  const cl=E('div','panel','<h3>💼 Histori Klub</h3>');
  if(!cc.clubs.length){cl.appendChild(E('p','muted','Belum ada histori.'));}
  cc.clubs.slice().reverse().forEach(x=>{
    const periode = x.leftSeason? `${x.joinedSeason} → ${x.leftSeason}` : `${x.joinedSeason} → sekarang`;
    cl.appendChild(E('div','pill',`<b>${x.club}</b> · ${periode} · 🏆 ${x.trophies||0}`));
  });
  pane.appendChild(cl);

  if(cc.titles.length){
    const tl=E('div','panel','<h3>🏆 Daftar Trofi</h3>');
    cc.titles.slice().reverse().forEach(t=>tl.appendChild(E('div','pill',`${t.season} · <b>${t.title}</b> (${t.club})`)));
    pane.appendChild(tl);
  }
}

// ---------- Match ----------
function playWeek(){
  const c=myC(),lid=c.league;
  if(W.leagueDay[lid]>=W.leagueFix[lid].length){
    const myName=c.name;
    const sum=endSeason(W);
    if(typeof coachScanLastSeason==='function') coachScanLastSeason(W, myName);
    toastW(`Musim selesai! Kamu finis peringkat ${sum.pos}. Cek tab Turnamen & Sejarah. Musim ${W.seasonLabel} dimulai.`);
    refresh();return;
  }
  const out=playWorldMatchday(W);
  // Catat hasil laga pelatih untuk statistik karir.
  if(out.myMatch && typeof coachRecordResult==='function'){
    const m=out.myMatch;
    const meHome=m.homeId===W.myClub;
    const gf=meHome?m.home:m.away, ga=meHome?m.away:m.home;
    coachRecordResult(W, gf, ga);
  }
  if(out.myMatch) matchModal(out.myMatch); else { refresh(); }
}
function matchModal(m){
  const modal=q('#match-modal');modal.classList.remove('hidden');
  const h=W.clubs[m.homeId],a=W.clubs[m.awayId];
  q('#match-title').textContent=`${h.name} vs ${a.name}`;
  const sc=q('#match-score'),log=q('#match-log'),close=q('#match-close');
  sc.textContent='0 - 0';log.innerHTML='';close.classList.add('hidden');
  // Use full timeline if present (goals + cards + VAR), else fall back to scorers.
  const ev=(m.timeline && m.timeline.length)? m.timeline.slice()
    : m.scorers.map(s=>({m:s.m,type:'goal',team:s.team,text:`⚽ ${s.m}' GOL! ${s.name}`}));
  let hg=0,ag=0,i=0;
  const timer=setInterval(()=>{
    if(i>=ev.length){clearInterval(timer);log.appendChild(E('div',null,`<b>Peluit panjang!</b> ${m.home} - ${m.away}`));close.classList.remove('hidden');log.scrollTop=log.scrollHeight;return;}
    const e=ev[i++];
    const mine=e.team===W.myClub;
    if(e.var) log.appendChild(E('div','muted',e.var));
    if(e.type==='goal' && !e.disallowed){ if(e.team===m.homeId)hg++; else ag++; sc.textContent=`${hg} - ${ag}`; }
    let cls = e.type==='goal'? (e.disallowed?'muted':(mine?'goal me':'goal')) : 'muted';
    let txt = e.disallowed? `❌ ${e.m}' Gol dianulir VAR (${e.text.replace(/^⚽ \d+' GOL! /,'')})` : e.text;
    log.appendChild(E('div',cls,txt));log.scrollTop=log.scrollHeight;
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
    tmp.myClub=target.id;W=tmp;
    if(typeof ensureCoach==='function'){W.coach=null;ensureCoach(W);}
    enter();
  };
  q('#w-load').onclick=()=>{const s=loadWorld();if(s){W=s;if(typeof ensureCoach==='function')ensureCoach(W);enter();}else toastW('Tidak ada simpanan.');};
  qa('.tab').forEach(t=>t.onclick=()=>tab(t.dataset.tab));
  q('#w-play').onclick=playWeek;
  q('#w-save').onclick=()=>{saveWorld(W);toastW('Permainan disimpan.');};
  q('#w-quit').onclick=()=>{if(confirm('Keluar ke menu utama?')){W=null;hud();show('screen-start');q('#w-load').disabled=!hasWorldSave();}};
});
