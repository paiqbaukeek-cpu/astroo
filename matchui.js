// ===== Ultra Super Kick Off - Match UI Extras =====
// Pergantian pemain interaktif saat menonton match & adu penalti visual.
// Murni client-side. Bergantung pada worldui globals (E, q) & engine2 (startingXI, irnd2).

// Hitung peluang sukses penalti seorang penendang (berdasarkan shoot & sedikit acak).
function penChance(p){
  const base = p ? clamp2(0.55 + (p.shoot-60)/120, 0.45, 0.92) : 0.7;
  return base;
}

// Jalankan adu penalti bergiliran (best of 5, lalu sudden death).
// Mengembalikan {homePens, awayPens, steps:[{team,scored,taker}], winner:'home'|'away'}.
function shootout(home, away){
  const hShooters = startingXI(home).slice().sort((a,b)=>b.shoot-a.shoot);
  const aShooters = startingXI(away).slice().sort((a,b)=>b.shoot-a.shoot);
  let h=0, a=0, steps=[];
  const take=(team, idx)=>{
    const list = team===home? hShooters : aShooters;
    const taker = list[idx % list.length];
    const scored = Math.random() < penChance(taker);
    steps.push({team: team.id, scored, taker: taker?taker.name:'Pemain'});
    return scored;
  };
  // 5 tendangan tiap tim
  for(let i=0;i<5;i++){ if(take(home,i)) h++; if(take(away,i)) a++; }
  // sudden death
  let i=5;
  while(h===a && i<20){ const hs=take(home,i)?1:0; const as=take(away,i)?1:0; h+=hs; a+=as; i++; }
  if(h===a){ Math.random()<0.5? h++ : a++; } // jaminan ada pemenang
  return { homePens:h, awayPens:a, steps, winner: h>a?'home':'away' };
}

// Render hasil adu penalti sebagai elemen untuk modal.
function renderShootout(so, home, away){
  const box=E('div','panel','<h3>⚽ Adu Penalti</h3>');
  box.appendChild(E('div','score',`${home.name} ${so.homePens} - ${so.awayPens} ${away.name}`));
  const grid=E('div','pen-grid');
  so.steps.forEach(s=>{
    const who = s.team===home.id? 'H':'A';
    grid.appendChild(E('div','pen-dot '+(s.scored?'in':'miss'), `${who}: ${s.scored?'✅':'❌'} ${s.taker}`));
  });
  box.appendChild(grid);
  box.appendChild(E('div','pill',`Pemenang: <b>${(so.winner==='home'?home:away).name}</b>`));
  return box;
}

// Panel pergantian pemain untuk match view (maks 5). onDone() dipanggil setelah sub.
function renderSubPanel(world, matchView, club, onDone){
  const wrap=E('div','panel','<h3>🔁 Pergantian Pemain</h3>');
  matchView.subs = matchView.subs||[];
  wrap.appendChild(E('p','muted',`Pergantian: ${matchView.subs.length}/5`));
  if(matchView.subs.length>=5){ wrap.appendChild(E('p','muted','Kuota pergantian habis.')); return wrap; }
  const xi = startingXI(club);
  // hilangkan pemain yang sudah keluar via sub sebelumnya
  const outIds = matchView.subs.map(s=>s.outId);
  const onPitch = xi.filter(p=>!outIds.includes(p.id));
  const benchIds = matchView.subs.map(s=>s.inId);
  const bench = club.squad.filter(p=>!xi.includes(p)&&!benchIds.includes(p.id)).sort((a,b)=>b.ovr-a.ovr);
  const row=E('div','row');
  const selOut=E('select'); onPitch.forEach(p=>{const o=E('option',null,`${p.pos} ${p.name} (${p.ovr})`);o.value=p.id;selOut.appendChild(o);});
  const selIn=E('select'); bench.forEach(p=>{const o=E('option',null,`${p.pos} ${p.name} (${p.ovr})`);o.value=p.id;selIn.appendChild(o);});
  const btn=E('button','btn small primary','Tukar');
  btn.disabled = !bench.length;
  btn.onclick=()=>{
    const r=makeSub(matchView, selOut.value, selIn.value);
    if(r.ok && typeof toastW==='function') toastW(r.msg);
    if(onDone) onDone();
  };
  row.appendChild(E('span','pill','Keluar'));row.appendChild(selOut);
  row.appendChild(E('span','pill','Masuk'));row.appendChild(selIn);
  row.appendChild(btn);
  wrap.appendChild(row);
  return wrap;
}
