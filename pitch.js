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

// Render lapangan dengan starting XI klub sesuai formasi terpilih.
function renderPitch(club, formationKey){
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
      if(p) row.appendChild(playerCard(p));
    }
    pitch.appendChild(row);
  });
  return pitch;
}
