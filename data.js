// Static data: clubs, player name pools, formations.
const FORMATIONS = {
  '4-4-2': { GK:1, DEF:4, MID:4, FWD:2 },
  '4-3-3': { GK:1, DEF:4, MID:3, FWD:3 },
  '3-5-2': { GK:1, DEF:3, MID:5, FWD:2 },
  '5-3-2': { GK:1, DEF:5, MID:3, FWD:2 },
  '4-2-3-1': { GK:1, DEF:4, MID:5, FWD:1 }
};

const MENTALITY = ['Bertahan','Seimbang','Menyerang'];

const FIRST_NAMES = ['Andi','Budi','Citra','Dimas','Eko','Fajar','Galih','Hadi','Irfan','Joko','Krisna','Lukas','Made','Nanda','Oka','Putra','Rizki','Surya','Teguh','Umar','Vino','Wahyu','Yoga','Zaki','Bayu','Reza','Doni','Gilang','Hendra','Aldi'];
const LAST_NAMES = ['Pratama','Saputra','Wijaya','Nugroho','Santoso','Hidayat','Kurniawan','Setiawan','Permana','Maulana','Ramadhan','Firmansyah','Gunawan','Hartono','Susanto','Wibowo','Prasetyo','Anggara','Mahendra','Syahputra'];

// Each club: name, short, rating influences starting squad strength, budget.
const CLUBS = [
  { id:'garuda', name:'Garuda United', short:'GAR', rating:82, budget:45 },
  { id:'rajawali', name:'Rajawali FC', short:'RAJ', rating:80, budget:40 },
  { id:'harimau', name:'Harimau Selatan', short:'HAR', rating:78, budget:34 },
  { id:'banteng', name:'Banteng Merah', short:'BAN', rating:76, budget:30 },
  { id:'elang', name:'Elang Jaya', short:'ELA', rating:74, budget:26 },
  { id:'naga', name:'Naga Biru', short:'NAG', rating:72, budget:22 },
  { id:'singa', name:'Singa Putih', short:'SIN', rating:70, budget:18 },
  { id:'badai', name:'Badai Timur', short:'BAD', rating:68, budget:15 }
];
