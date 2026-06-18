# ⚽ Ultra Super Kick Off

Game **manajer karir sepak bola** berbasis browser, terinspirasi Super Kick Off dan game manajer klasik. Murni HTML + CSS + JavaScript, tanpa library, tanpa build step. Semua fitur **berfungsi penuh**.

## Cara Main

1. Clone / download repo ini.
2. Buka `index.html` langsung di browser (double-click). Tidak perlu server.
3. Masukkan nama manajer, pilih klub, klik **Mulai Karir**.

> Untuk dimainkan online via GitLab Pages, aktifkan Pages dengan menyajikan folder root.

## Fitur (World Edition)

- **Pilih liga & klub** dari 6 liga negara (Inggris, Spanyol, Italia, Jerman, Prancis, Indonesia), 110+ klub bernama plesetan.
- **Ribuan pemain** ter-generate dengan **kebangsaan** dan nama sesuai negara.
- **Semua turnamen seperti dunia nyata** tiap musim:
  - Liga domestik tiap negara (juara per liga)
  - Piala domestik (Piala FA, Copa del Rey, Coppa Italia, DFB Pokal, Coupe de France, Piala Indonesia)
  - Piala Super domestik
  - Liga Champions Eropa, Liga Eropa, Konferensi Eropa, Liga Champions Asia
  - Piala Dunia Antarklub
  - Antarnegara berkala: Piala Dunia (tiap 4 musim), Piala Eropa, Copa America, Piala Asia
- **Sejarah / Palmares** mencatat semua juara tiap musim.
- **Musim berganti otomatis** (label 25/26 -> 26/27), pemain menua, regenerasi pemain muda, hadiah peringkat.

### Fitur dasar

- **Pilih klub** dari 8 klub dengan rating & dana berbeda.
- **Skuad lengkap** tiap pemain punya OVR, atribut (pace, shoot, pass, defend, stamina), umur, morale, form, nilai pasar, dan statistik gol/penampilan.
- **Taktik**: pilih formasi (4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1) dan mentalitas (Bertahan/Seimbang/Menyerang) yang benar-benar memengaruhi kekuatan tim.
- **Starting XI otomatis** berdasarkan formasi & kekuatan efektif pemain.
- **Simulasi pertandingan** menit-per-menit dengan log gol langsung, berbasis kekuatan serangan/pertahanan + keunggulan kandang + faktor acak.
- **Liga penuh** double round-robin, klasemen otomatis (poin, selisih gol), jadwal & hasil.
- **Transfer**: beli pemain dari bursa & jual pemain dari skuad sesuai anggaran.
- **Latihan**: tingkatkan atribut pemain, OVR & nilai pasar ikut naik.
- **Progres karir antar musim**: pemain menua, dana hadiah sesuai peringkat, bursa transfer baru, fixtures baru.
- **Simpan / Muat** otomatis via localStorage.

## Struktur File

| File | Isi |
|------|-----|
| `index.html` | Struktur layar & navigasi |
| `styles.css` | Tampilan/tema gelap |
| `data.js` | Data klub, formasi, pool nama |
| `engine.js` | Logika game (generate, simulasi, liga, transfer, latihan, save) |
| `ui.js` | Render UI & interaksi |

## Pengembangan Lanjutan (ide)

- Cedera & kartu, kompetisi piala, kontrak & gaji, akademi muda, komentar pertandingan lebih detail.
