HORORMIN — Website Video Horor
================================

Isi folder:
  index.html          -> halaman utama (full page, satu file HTML)
  css/style.css       -> semua styling (responsif & fluid)
  js/main.js          -> logic carousel, lightbox player, dsb.
  js/videos.json      -> daftar video (id YouTube, tag, tingkat serem)
  favicon.svg         -> favicon utama (vector, browser modern)
  favicon.ico         -> favicon fallback (16/32/48px, browser lama)
  favicon-16.png
  favicon-32.png      -> favicon PNG per ukuran
  apple-touch-icon.png -> ikon saat disimpan ke homescreen iOS

FAVICON
-------
Desain favicon dibuat khusus untuk Horormin: monogram huruf "H" merah
darah dengan tetesan darah di bagian bawah, ditambah aksen retak kaca
tipis di pojok, di atas badge hitam membulat — konsisten dengan palet
merah/hitam/putih dan nuansa horor di seluruh situs. Sumber vektornya
ada di favicon.svg, jadi gampang diubah warnanya kalau perlu (tinggal
edit atribut fill di file tersebut).

CARA MENJALANKAN
-----------------
1. Cara termudah: klik dua kali index.html untuk membuka langsung di browser.
2. Cara terbaik (disarankan): jalankan lewat local server supaya fetch
   terhadap js/videos.json dan pengambilan judul video (via noembed.com)
   berjalan sempurna di semua browser. Contoh, dari dalam folder ini:

     python3 -m http.server 8000

   lalu buka http://localhost:8000 di browser.

   Jika dibuka langsung tanpa server dan fetch videos.json gagal (karena
   batasan file://), situs otomatis memakai data cadangan yang sudah
   tertanam di js/main.js — carousel tetap tampil normal.

CATATAN
-------
- Thumbnail video diambil langsung dari CDN resmi YouTube
  (i.ytimg.com/vi/{id}/hqdefault.jpg) — gambar asli, bukan hasil generate,
  dan aman untuk dipakai sebagai preview video yang memang ditautkan/di-embed.
- Judul & nama channel asli diambil otomatis saat halaman dibuka (lewat
  noembed.com, proxy oEmbed publik untuk YouTube). Jika tidak ada koneksi
  internet, judul cadangan ("Cerita Horor Malam #1", dst.) akan tetap tampil.
- Video diputar lewat youtube-nocookie.com embed di dalam modal (lightbox),
  jadi tidak mengunduh/menyimpan video apa pun — murni tautan resmi YouTube.
- Untuk mengganti daftar video: edit js/videos.json, isi "id" dengan ID
  video YouTube (11 karakter setelah watch?v= atau setelah youtu.be/).

Selamat menakut-nakuti. 🩸
