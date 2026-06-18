// ===== Ultra Super Kick Off - Lapangan & Kartu Pemain Grafis =====
// Modul UI murni client-side untuk nuansa mobile ala Super Kick Off:
// menempatkan starting XI di lapangan sesuai formasi dengan kartu berwarna.
// Bergantung pada worldui globals: E (createElement helper), startingXI, FORMATIONS-like.

// Tier warna berdasarkan OVR (mirip kartu game mobile).
function ratingTier(ovr){
  if(ovr>=85) return 'elite';     // ungu/emas
  if(ovr>=78) return 'great';     // hijau
  if(ovr>=70) return 'good';      // biru
  if(ovr>=62) return 'avg';       // kuning
  return 'low';                   // oranye/merah
}

// Kartu pemain ringkas (dipakai di pitch & daftar).
function playerCard(p){
  const tier=ratingTier(p.ovr);
  const card=E('div','pcard '+tier);
  card.innerHTML=
    `<div class="pcard-ovr">${p.ovr}</div>`+
    `<div class="pcard-pos">${p.pos}</div>`+
    `<div class="pcard-name">${p.name.split(' ').slice(-1)[0]}</div>`;
  return card;
}

// Susunan baris per formasi pada lapangan (dari belakang/GK ke depan).
// Tiap entri: jumlah pemain pada baris itu untuk posisi tertentu.
const PITCH_ROWS = {
  '4-4-2': [['GK',1],['DEF',4],['MID',4],['FWD',2]],
  '4-3-3': [['GK',1],['DEF',4],['MID',3],['FWD',3]],
  '3-5-2': [['GK',1],['DEF',3],['MID',5],['FWD',2]],
  '5-3-2': [['GK',1],['DEF',5],['MID',3],['FWD',2]],
  '4-2-3-1':[['GK',1],['DEF',4],['MID',5],['FWD',1]]
};

// State drag sederhana (id pemain yang sedang dipilih/diseret).
let _dragId = null;

// Kartu pemain interaktif: dapat di-drag & diklik untuk ditukar.
// onSwap(idA,idB) dipanggil saat dua pemain ditukar.
function interactiveCard(p, onSwap){
  const card = playerCard(p);
  card.draggable = true;
  card.dataset.pid = p.id;
  card.style.cursor = 'grab';
  // Desktop: drag & drop
  card.addEventListener('dragstart', e=>{ _dragId=p.id; e.dataTransfer.setData('text/plain',p.id); card.style.opacity='.5'; });
  card.addEventListener('dragend', ()=>{ card.style.opacity='1'; });
  card.addEventListener('dragover', e=>e.preventDefault());
  card.addEventListener('drop', e=>{ e.preventDefault(); const from=e.dataTransfer.getData('text/plain')||_dragId; if(from && from!==p.id) onSwap(from,p.id); _dragId=null; });
  // Mobile/klik: pilih lalu klik target untuk menukar
  card.addEventListener('click', ()=>{
    if(_dragId && _dragId!==p.id){ onSwap(_dragId,p.id); _dragId=null; document.querySelectorAll('.pcard.sel').forEach(x=>x.classList.remove('sel')); }
    else { document.querySelectorAll('.pcard.sel').forEach(x=>x.classList.remove('sel')); _dragId=p.id; card.classList.add('sel'); }
  });
  return card;
}

// Render lapangan dengan starting XI klub sesuai formasi terpilih.
// Jika onSwap diberikan, kartu menjadi interaktif (drag/klik untuk menukar).
function renderPitch(club, formationKey, onSwap){
  const fk = formationKey || club.formation || '4-4-2';
  const rowsPlan = PITCH_ROWS[fk] || PITCH_ROWS['4-4-2'];
  const xi = startingXI(club);
  // kelompokkan pemain per posisi, urut OVR desc
  const byPos = {GK:[],DEF:[],MID:[],FWD:[]};
  xi.forEach(p=>{ (byPos[p.pos]||byPos.MID).push(p); });
  Object.keys(byPos).forEach(k=>byPos[k].sort((a,b)=>b.ovr-a.ovr));

  const pitch = E('div','pitch');
  rowsPlan.forEach(([pos,count])=>{
    const row = E('div','pitch-row');
    for(let i=0;i<count;i++){
      const p = byPos[pos] && byPos[pos].shift();
      if(p) row.appendChild(onSwap? interactiveCard(p,onSwap) : playerCard(p));
    }
    pitch.appendChild(row);
  });
  return pitch;
}

// Render daftar pemain cadangan (bukan starter) sebagai kartu interaktif.
function renderBench(club, onSwap){
  const xiIds = startingXI(club).map(p=>p.id);
  const bench = club.squad.filter(p=>!xiIds.includes(p.id)).sort((a,b)=>b.ovr-a.ovr);
  const wrap = E('div','bench');
  bench.forEach(p=> wrap.appendChild(onSwap? interactiveCard(p,onSwap) : playerCard(p)));
  return wrap;
}
