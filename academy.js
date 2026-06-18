// ===== Ultra Super Kick Off - Akademi Muda & Legenda Klub =====
// Modul murni client-side. Mengelola prospek muda (potensi tinggi) per klub,
// pengembangan tiap musim, promosi ke skuad utama, dan pencatatan legenda klub.
// Bergantung pada engine2 globals: genPlayer, valueOf, wageOf, irnd2, pick2, clamp2, POS.

// Buat satu prospek muda (usia 16-19) dengan potensi di atas OVR saat ini.
function makeProspect(clubRating, nat){
  const p = genPlayer(pick2(POS), clubRating - irnd2(8,18), nat);
  p.age = irnd2(16,19);
  // potensi: target OVR akhir, lebih tinggi dari OVR sekarang
  p.potential = clamp2(p.ovr + irnd2(6,20), p.ovr, 95);
  p.academy = true;
  p.value = valueOf(p);
  p.wage = wageOf(p);
  return p;
}

// Pastikan tiap klub punya array akademi. Migrasi ringan untuk save lama.
function ensureAcademy(world){
  Object.values(world.clubs).forEach(c=>{
    if(!c.academy){
      c.academy = [];
      const n = irnd2(3,5);
      for(let i=0;i<n;i++) c.academy.push(makeProspect(c.rating, c.country));
    }
  });
}

// Daftar prospek akademi klub pelatih.
function academyList(world){
  const c = world.clubs[world.myClub];
  if(!c.academy) ensureAcademy(world);
  return (c.academy||[]).slice().sort((a,b)=>(b.potential||0)-(a.potential||0));
}

// Promosikan prospek ke skuad utama.
function promoteYouth(world, playerId){
  const c = world.clubs[world.myClub];
  if(!c.academy) return {ok:false,msg:'Akademi kosong.'};
  const i = c.academy.findIndex(p=>p.id===playerId);
  if(i<0) return {ok:false,msg:'Pemain tidak ada.'};
  const p = c.academy[i];
  c.academy.splice(i,1);
  delete p.academy;
  c.squad.push(p);
  return {ok:true,msg:`${p.name} dipromosikan ke skuad utama!`};
}

// Kembangkan akademi tiap akhir musim: prospek menua & OVR mendekati potensi.
// Prospek yang sudah cukup matang otomatis dipromosikan; isi ulang slot kosong.
function developAcademies(world){
  Object.values(world.clubs).forEach(c=>{
    if(!c.academy) c.academy=[];
    c.academy.forEach(p=>{
      p.age++;
      const gap = (p.potential||p.ovr) - p.ovr;
      if(gap>0){
        const growth = Math.min(gap, irnd2(2,6));
        p.ovr = clamp2(p.ovr+growth, 45, 99);
        ['pace','shoot','pass','defend'].forEach(k=>{ p[k]=clamp2(p[k]+irnd2(0,growth),40,99); });
      }
      p.value = valueOf(p);
      p.wage = wageOf(p);
    });
    // Promosi otomatis prospek matang (usia >=20 atau sudah dekat potensi) untuk AI klub.
    if(c.id!==world.myClub){
      for(let i=c.academy.length-1;i>=0;i--){
        const p=c.academy[i];
        if(p.age>=20 || (p.potential-p.ovr)<=2){ c.academy.splice(i,1); delete p.academy; c.squad.push(p); }
      }
    }
    // Isi ulang slot akademi agar tetap 3-5 prospek.
    while(c.academy.length<3) c.academy.push(makeProspect(c.rating, c.country));
  });
}

// Catat pemain pensiun sebagai legenda klub (dipakai retirePlayer).
function recordLegend(world, club, player){
  if(typeof ensureCoach!=='function') return;
  const cc = ensureCoach(world);
  const entry = cc.clubs.find(c=>c.club===club.name && c.leftSeason===null);
  if(entry){
    entry.legends = entry.legends || [];
    entry.legends.push({ name:player.name, pos:player.pos, nat:player.nat, ovr:player.ovr,
      goals:player.goals||0, apps:player.apps||0, season:world.seasonLabel });
  }
}
