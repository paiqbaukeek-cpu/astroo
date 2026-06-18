// ===== Ultra Super Kick Off - Profil & Karir Pelatih =====
// Modul murni client-side. Melacak statistik pribadi pelatih (menang, seri,
// kalah, trofi) dan histori klub yang pernah dilatih. Tanpa DOM, tanpa backend.
// Bergantung pada state "world" (W) dari engine2/worldui.

// Pastikan struktur profil pelatih tersedia pada world. Aman dipanggil berkali-kali
// dan kompatibel dengan save lama (migrasi ringan: cukup buat objek jika belum ada).
function ensureCoach(world){
  if(!world) return null;
  if(!world.coach){
    world.coach = {
      name: world.manager || 'Manajer',
      W:0, D:0, L:0,        // rekor pertandingan liga sepanjang karir
      trophies:0,           // total trofi (liga + piala) yang dimenangkan
      titles:[],            // daftar trofi: {season, title, club}
      clubs:[],             // histori klub: {club, joinedSeason, leftSeason|null}
      startedSeason: world.seasonLabel || '-'
    };
  }
  // Pastikan ada entri klub aktif saat ini.
  const cur = world.clubs[world.myClub];
  if(cur && !world.coach.clubs.some(c=>c.club===cur.name && c.leftSeason===null)){
    // tutup entri lama yang masih terbuka tapi bukan klub sekarang
    world.coach.clubs.forEach(c=>{ if(c.leftSeason===null && c.club!==cur.name) c.leftSeason=world.seasonLabel; });
    if(!world.coach.clubs.some(c=>c.club===cur.name && c.leftSeason===null)){
      world.coach.clubs.push({ club:cur.name, joinedSeason:world.seasonLabel, leftSeason:null, trophies:0 });
    }
  }
  return world.coach;
}

// Catat hasil satu pertandingan pelatih (dipanggil dari playWeek untuk laga liga).
function coachRecordResult(world, gf, ga){
  const cc = ensureCoach(world);
  if(!cc) return;
  if(gf>ga) cc.W++;
  else if(gf===ga) cc.D++;
  else cc.L++;
}

// Catat trofi yang dimenangkan klub pelatih pada akhir musim.
function coachRecordTrophy(world, title){
  const cc = ensureCoach(world);
  if(!cc) return;
  const cur = world.clubs[world.myClub];
  cc.trophies++;
  cc.titles.push({ season: world.seasonLabel, title, club: cur?cur.name:'-' });
  const entry = cc.clubs.find(c=>cur && c.club===cur.name && c.leftSeason===null);
  if(entry) entry.trophies = (entry.trophies||0)+1;
}

// Hitung trofi musim lalu untuk klub pelatih berdasarkan hasil turnamen & juara liga.
// Dipanggil SETELAH endSeason mengisi world.history (entri terakhir = musim baru saja).
function coachScanLastSeason(world, myClubName){
  const cc = ensureCoach(world);
  if(!cc || !world.history.length) return;
  const h = world.history[world.history.length-1];
  const won = [];
  // Juara liga
  Object.entries(h.leagues||{}).forEach(([liga,juara])=>{ if(juara===myClubName) won.push('Juara '+liga); });
  // Piala-piala (nilai berupa nama juara)
  [['domesticCups',''],['contCups',''],['superCups','']].forEach(([key])=>{
    Object.entries(h[key]||{}).forEach(([nama,juara])=>{ if(juara===myClubName) won.push(nama); });
  });
  if(h.clubWorldCup) Object.entries(h.clubWorldCup).forEach(([nama,juara])=>{ if(juara===myClubName) won.push(nama); });
  won.forEach(t=>coachRecordTrophy(world, t));
}

// Persentase kemenangan untuk ringkasan profil.
function coachWinPct(cc){
  const tot = cc.W+cc.D+cc.L;
  return tot? Math.round(cc.W/tot*100) : 0;
}

// ===== Negosiasi & kontrak pelatih =====
// Tetapkan kontrak pelatih aktif (durasi dalam musim, target peringkat akhir).
function setCoachContract(world, durasi, targetPeringkat){
  const cc = ensureCoach(world);
  if(!cc) return;
  cc.contract = {
    durasi: durasi,                 // total musim kontrak
    sisa: durasi,                   // sisa musim
    target: targetPeringkat,        // target maksimal peringkat liga (mis. <=4)
    mulai: world.seasonLabel
  };
  const cur = world.clubs[world.myClub];
  const entry = cc.clubs.find(c=>cur && c.club===cur.name && c.leftSeason===null);
  if(entry){ entry.contractDurasi=durasi; entry.contractTarget=targetPeringkat; }
}

// Saran target peringkat berdasarkan rating klub relatif di liganya.
function suggestedTarget(world, clubId){
  const c = world.clubs[clubId];
  const liga = (typeof tableOf==='function') ? tableOf(world, c.league) : [];
  const n = liga.length || 18;
  // klub kuat → target juara/4 besar; klub lemah → target aman dari degradasi
  const rank = liga.findIndex(x=>x.id===clubId);
  const base = rank>=0 ? rank+1 : Math.round(n/2);
  if(c.rating>=84) return Math.max(1,Math.min(4,base));
  if(c.rating>=78) return Math.min(6,Math.max(4,base));
  if(c.rating>=72) return Math.min(10,Math.max(8,base));
  return Math.min(n-2,Math.max(n-6,base));
}

// Evaluasi target kontrak tiap akhir musim. Mengembalikan {ada, terpenuhi, pos, target}.
function evaluateContract(world, finalPos){
  const cc = ensureCoach(world);
  if(!cc || !cc.contract) return {ada:false};
  const c = cc.contract;
  const terpenuhi = finalPos <= c.target;
  c.sisa = Math.max(0, (c.sisa||1) - 1);
  if(!cc.contractLog) cc.contractLog = [];
  cc.contractLog.push({ season: world.seasonLabel, pos: finalPos, target: c.target, terpenuhi });
  return {ada:true, terpenuhi, pos:finalPos, target:c.target, sisa:c.sisa, habis:c.sisa<=0};
}
