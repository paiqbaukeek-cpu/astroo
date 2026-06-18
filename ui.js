// ===== Ultra Super Kick Off - UI Layer =====
let STATE = null;
let selectedClubId = null;

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const el = (tag,cls,html)=>{ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
const money = v => v.toFixed(1)+' jt';

// ---------- Start screen ----------
function renderClubPicker(){
  const grid=$('#club-picker'); grid.innerHTML='';
  CLUBS.forEach(c=>{
    const card=el('div','club-card');
    card.innerHTML=`<div class="nm">${c.name}</div><div class="meta">Rating ${c.rating} · Dana ${c.budget} jt</div>`;
    card.onclick=()=>{ selectedClubId=c.id; $$('.club-card').forEach(x=>x.classList.remove('selected')); card.classList.add('selected'); };
    grid.appendChild(card);
  });
}

function showScreen(id){ $$('.screen').forEach(s=>s.classList.remove('active')); $('#'+id).classList.add('active'); }

// ---------- HUD ----------
function renderHUD(){
  if(!STATE){ $('#hud').innerHTML=''; return; }
  const c=myClub(STATE);
  const total=STATE.fixtures.length;
  $('#hud').innerHTML =
    `<span>Manajer: <b>${STATE.manager}</b></span>`+
    `<span>Klub: <b>${c.name}</b></span>`+
    `<span>Musim: <b>${STATE.season}</b></span>`+
    `<span>Pekan: <b>${Math.min(STATE.matchday+1,total)}/${total}</b></span>`+
    `<span>Dana: <b>${money(c.budget)}</b></span>`;
}

// ---------- Tabs ----------
function switchTab(name){
  $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
  $$('.tabpane').forEach(p=>p.classList.remove('active'));
  $('#tab-'+name).classList.add('active');
  ({squad:renderSquad,tactics:renderTactics,training:renderTraining,transfer:renderTransfer,fixtures:renderFixtures,table:renderTable})[name]();
}

// ---------- Squad ----------
function renderSquad(){
  const c=myClub(STATE);
  const pane=$('#tab-squad'); pane.innerHTML='';
  pane.appendChild(el('p','muted',`Skuad ${c.name} · ${c.squad.length} pemain · Pemain bertanda hijau adalah starter (${c.formation}).`));
  const order={GK:0,DEF:1,MID:2,FWD:3};
  const sorted=c.squad.slice().sort((a,b)=> order[a.pos]-order[b.pos] || b.ovr-a.ovr);
  const t=el('table');
  t.innerHTML=`<thead><tr><th>Pos</th><th>Nama</th><th>Umur</th><th>OVR</th><th>Stamina</th><th>Form</th><th>Gol</th><th>Nilai</th></tr></thead>`;
  const tb=el('tbody');
  sorted.forEach(p=>{
    const starter=c.lineup.includes(p.id);
    const tr=el('tr', starter?'starter':'');
    tr.innerHTML=`<td><span class="pos ${p.pos}">${p.pos}</span></td>`+
      `<td>${p.name}</td><td>${p.age}</td><td><b>${p.ovr}</b></td>`+
      `<td><div class="bar"><i style="width:${p.stamina}%"></i></div></td>`+
      `<td>${formIcon(p.form)}</td><td>${p.goals}</td><td>${money(p.value)}</td>`;
    tb.appendChild(tr);
  });
  t.appendChild(tb); pane.appendChild(t);
}
function formIcon(f){ if(f>1)return '🔥'; if(f>0)return '↗'; if(f<-1)return '↓'; if(f<0)return '↘'; return '→'; }

// ---------- Tactics ----------
function renderTactics(){
  const c=myClub(STATE);
  const pane=$('#tab-tactics'); pane.innerHTML='';
  const box=el('div','panel');
  box.innerHTML=`<h3>Taktik Tim</h3>`;
  const fRow=el('label','field'); fRow.innerHTML='<span>Formasi</span>';
  const fSel=el('select');
  Object.keys(FORMATIONS).forEach(f=>{ const o=el('option',null,f); o.value=f; if(f===c.formation)o.selected=true; fSel.appendChild(o); });
  fSel.onchange=()=>{ c.formation=fSel.value; autoPickLineup(c); renderTactics(); renderHUD(); };
  fRow.appendChild(fSel);
  const mRow=el('label','field'); mRow.innerHTML='<span>Mentalitas</span>';
  const mSel=el('select');
  MENTALITY.forEach((m,i)=>{ const o=el('option',null,m); o.value=i; if(i===c.mentality)o.selected=true; mSel.appendChild(o); });
  mSel.onchange=()=>{ c.mentality=+mSel.value; renderTactics(); };
  mRow.appendChild(mSel);
  box.appendChild(fRow); box.appendChild(mRow);
  const s=teamStrength(c);
  box.appendChild(el('div','row',
    `<span class="pill">Serangan: <b>${s.attack.toFixed(1)}</b></span>`+
    `<span class="pill">Pertahanan: <b>${s.defense.toFixed(1)}</b></span>`+
    `<span class="pill">Kekuatan: <b>${s.overall.toFixed(1)}</b></span>`));
  const btn=el('button','btn',' Susun Ulang Starter Otomatis'); btn.onclick=()=>{autoPickLineup(c);renderTactics();};
  box.appendChild(btn);
  pane.appendChild(box);

  // starting XI list
  const xi=el('div','panel'); xi.innerHTML='<h3>Starting XI</h3>';
  const starters=c.lineup.map(id=>c.squad.find(p=>p.id===id)).filter(Boolean)
    .sort((a,b)=>({GK:0,DEF:1,MID:2,FWD:3})[a.pos]-({GK:0,DEF:1,MID:2,FWD:3})[b.pos]);
  starters.forEach(p=> xi.appendChild(el('div','pill',`<span class="pos ${p.pos}">${p.pos}</span> ${p.name} (${p.ovr})`)));
  pane.appendChild(xi);
}

// ---------- Training ----------
function renderTraining(){
  const c=myClub(STATE);
  const pane=$('#tab-training'); pane.innerHTML='';
  pane.appendChild(el('p','muted','Latih atribut pemain. Tiap latihan menambah +1..+3 dan menaikkan OVR & nilai pemain.'));
  const t=el('table');
  t.innerHTML=`<thead><tr><th>Nama</th><th>Pos</th><th>OVR</th><th>Pace</th><th>Shoot</th><th>Pass</th><th>Defend</th><th>Stamina</th><th>Latih</th></tr></thead>`;
  const tb=el('tbody');
  c.squad.slice().sort((a,b)=>b.ovr-a.ovr).forEach(p=>{
    const tr=el('tr');
    const attrs=['pace','shoot','pass','defend','stamina'];
    const sel=`<select data-attr><option value="pace">Pace</option><option value="shoot">Shoot</option><option value="pass">Pass</option><option value="defend">Defend</option><option value="stamina">Stamina</option></select>`;
    tr.innerHTML=`<td>${p.name}</td><td><span class="pos ${p.pos}">${p.pos}</span></td><td><b>${p.ovr}</b></td>`+
      `<td>${p.pace}</td><td>${p.shoot}</td><td>${p.pass}</td><td>${p.defend}</td><td>${p.stamina}</td>`+
      `<td>${sel} <button class="btn small" data-train>Go</button></td>`;
    const btn=tr.querySelector('[data-train]'); const dd=tr.querySelector('[data-attr]');
    btn.onclick=()=>{ if(trainPlayer(p,dd.value)){renderTraining();renderHUD();} };
    tb.appendChild(tr);
  });
  t.appendChild(tb); pane.appendChild(t);
}

// ---------- Transfer ----------
function renderTransfer(){
  const c=myClub(STATE);
  const pane=$('#tab-transfer'); pane.innerHTML='';
  pane.appendChild(el('p','muted',`Dana tersedia: <b>${money(c.budget)}</b>`));
  const grid=el('div','grid2');

  const buyBox=el('div','panel'); buyBox.innerHTML='<h3>Bursa Transfer (Beli)</h3>';
  const bt=el('table');
  bt.innerHTML=`<thead><tr><th>Pos</th><th>Nama</th><th>Umur</th><th>OVR</th><th>Harga</th><th></th></tr></thead>`;
  const btb=el('tbody');
  STATE.transferMarket.slice().sort((a,b)=>b.ovr-a.ovr).forEach(p=>{
    const tr=el('tr');
    tr.innerHTML=`<td><span class="pos ${p.pos}">${p.pos}</span></td><td>${p.name}</td><td>${p.age}</td><td><b>${p.ovr}</b></td><td>${money(p.askingPrice)}</td>`;
    const cell=el('td'); const b=el('button','btn small primary','Beli');
    b.disabled=c.budget<p.askingPrice;
    b.onclick=()=>{ const r=buyPlayer(STATE,p); toast(r.msg); renderTransfer(); renderHUD(); };
    cell.appendChild(b); tr.appendChild(cell); btb.appendChild(tr);
  });
  bt.appendChild(btb); buyBox.appendChild(bt);

  const sellBox=el('div','panel'); sellBox.innerHTML='<h3>Skuad (Jual)</h3>';
  const st=el('table');
  st.innerHTML=`<thead><tr><th>Pos</th><th>Nama</th><th>OVR</th><th>Nilai</th><th></th></tr></thead>`;
  const stb=el('tbody');
  c.squad.slice().sort((a,b)=>a.ovr-b.ovr).forEach(p=>{
    const tr=el('tr');
    tr.innerHTML=`<td><span class="pos ${p.pos}">${p.pos}</span></td><td>${p.name}</td><td>${p.ovr}</td><td>${money(p.value)}</td>`;
    const cell=el('td'); const b=el('button','btn small','Jual');
    b.onclick=()=>{ const r=sellPlayer(STATE,p.id); toast(r.msg); renderTransfer(); renderHUD(); };
    cell.appendChild(b); tr.appendChild(cell); stb.appendChild(tr);
  });
  st.appendChild(stb); sellBox.appendChild(st);

  grid.appendChild(buyBox); grid.appendChild(sellBox); pane.appendChild(grid);
}

// ---------- Fixtures ----------
function renderFixtures(){
  const pane=$('#tab-fixtures'); pane.innerHTML='';
  STATE.fixtures.forEach((round,i)=>{
    const played=i<STATE.matchday;
    const next=i===STATE.matchday;
    const box=el('div','panel');
    box.innerHTML=`<h3>Pekan ${i+1} ${next?'<span class="pill">Berikutnya</span>':''}</h3>`;
    round.forEach(([hId,aId])=>{
      const h=STATE.clubs[hId], a=STATE.clubs[aId];
      let res='vs';
      if(played){ const dr=STATE.results[i].find(r=>r.homeId===hId&&r.awayId===aId); if(dr) res=`<b>${dr.home} - ${dr.away}</b>`; }
      const mine=(hId===STATE.myClub||aId===STATE.myClub)?'me':'';
      const line=el('div',mine?'pill me':'pill',`${h.name} ${res} ${a.name}`);
      box.appendChild(line);
    });
    pane.appendChild(box);
  });
}

// ---------- Table ----------
function renderTable(){
  const pane=$('#tab-table'); pane.innerHTML='';
  const t=el('table');
  t.innerHTML=`<thead><tr><th>#</th><th>Klub</th><th>M</th><th>M</th><th>S</th><th>K</th><th>GM</th><th>GK</th><th>SG</th><th>Poin</th></tr></thead>`;
  const tb=el('tbody');
  sortedTable(STATE).forEach((c,i)=>{
    const tr=el('tr', c.id===STATE.myClub?'me':'');
    tr.innerHTML=`<td>${i+1}</td><td>${c.name}</td><td>${c.P}</td><td>${c.W}</td><td>${c.D}</td><td>${c.L}</td><td>${c.GF}</td><td>${c.GA}</td><td>${c.GF-c.GA}</td><td><b>${c.Pts}</b></td>`;
    tb.appendChild(tr);
  });
  t.appendChild(tb); pane.appendChild(t);
}

// ---------- Match modal ----------
function playNext(){
  if(STATE.matchday>=STATE.fixtures.length){
    const r=startNewSeason(STATE);
    toast(`Musim selesai! Kamu finis peringkat ${r.pos}. Hadiah ${money(r.prize)}. Musim baru dimulai.`);
    refreshAll(); return;
  }
  const out=playMatchday(STATE);
  showMatch(out);
}

function showMatch(out){
  const modal=$('#match-modal'); modal.classList.remove('hidden');
  const m=out.myMatch;
  const h=STATE.clubs[m.homeId], a=STATE.clubs[m.awayId];
  $('#match-title').textContent=`${h.name} vs ${a.name}`;
  const scoreEl=$('#match-score'); const logEl=$('#match-log'); const closeBtn=$('#match-close');
  scoreEl.textContent='0 - 0'; logEl.innerHTML=''; closeBtn.classList.add('hidden');
  let hg=0,ag=0,idx=0;
  const ev=m.events.slice();
  const timer=setInterval(()=>{
    if(idx>=ev.length){
      clearInterval(timer);
      logEl.appendChild(el('div',null,`<b>Peluit panjang!</b> Skor akhir ${m.home} - ${m.away}`));
      closeBtn.classList.remove('hidden');
      logEl.scrollTop=logEl.scrollHeight;
      return;
    }
    const e=ev[idx++];
    if(e.homeId? false:false){}
    if(e.teamId===m.homeId) hg++; else ag++;
    scoreEl.textContent=`${hg} - ${ag}`;
    const mine=e.teamId===STATE.myClub;
    logEl.appendChild(el('div',mine?'goal me':'goal',`⚽ ${e.minute}' GOL! ${e.scorer} (${e.teamShort})`));
    logEl.scrollTop=logEl.scrollHeight;
  },350);
  closeBtn.onclick=()=>{
    modal.classList.add('hidden');
    if(out.finished) toast('Pekan terakhir selesai. Klik "Main" lagi untuk mengakhiri musim.');
    refreshAll();
  };
}

// ---------- helpers ----------
function toast(msg){
  const t=el('div','toast',msg);
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1f6feb;color:#fff;padding:10px 16px;border-radius:8px;z-index:50;box-shadow:0 4px 14px rgba(0,0,0,.4)';
  document.body.appendChild(t); setTimeout(()=>t.remove(),2600);
}
function refreshAll(){ renderHUD(); const active=$('.tab.active'); switchTab(active?active.dataset.tab:'squad'); }

function enterGame(){ showScreen('screen-game'); refreshAll(); }

// ---------- bootstrap ----------
window.addEventListener('DOMContentLoaded',()=>{
  renderClubPicker();
  $('#btn-load').disabled=!hasSave();
  $('#btn-start').onclick=()=>{
    if(!selectedClubId){ toast('Pilih klub dulu.'); return; }
    const name=$('#manager-name').value.trim()||'Manajer';
    STATE=newGame(name,selectedClubId);
    enterGame();
  };
  $('#btn-load').onclick=()=>{ const s=loadGame(); if(s){ STATE=s; enterGame(); } else toast('Tidak ada simpanan.'); };
  $$('.tab').forEach(t=> t.onclick=()=>switchTab(t.dataset.tab));
  $('#btn-play').onclick=playNext;
  $('#btn-save').onclick=()=>{ saveGame(STATE); toast('Permainan disimpan.'); };
  $('#btn-quit').onclick=()=>{ if(confirm('Keluar ke menu utama? Simpan dulu jika perlu.')){ STATE=null; renderHUD(); showScreen('screen-start'); $('#btn-load').disabled=!hasSave(); } };
});
