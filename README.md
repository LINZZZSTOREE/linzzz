# LINZZZSTOREE

Paket project ini sudah berisi:

- Homepage LINZZZSTOREE
- Halaman Info
- Digital Store
- Kategori horizontal
- Grid produk 4 kolom di HP / 7 kolom di desktop
- Popup produk
- Daftar harga dengan scroll
- Jumlah pesanan + / -
- Checkout WhatsApp
- QRIS placeholder (belum tersedia)
- Admin panel `/linzadmin404/admin.html`
- Tambah kategori
- Tambah produk
- Upload foto produk
- Banyak list harga per produk
- Flask API + SQLite untuk PythonAnywhere

## Struktur

```text
index.html
pages/
assets/
linzadmin404/
backend/
```

## 1. Gambar homepage

Pertahankan / masukkan gambar kamu ke:

```text
assets/images/background/digital_store.png
assets/images/background/tools.png
```

Folder yang dipakai memang `background`, bukan `backgrounds`.

## 2. Sambungkan PythonAnywhere

Setelah backend PythonAnywhere aktif, buka:

```text
assets/js/config.js
```

Lalu ubah:

```js
API_BASE: "https://GANTI_USERNAME.pythonanywhere.com"
```

menjadi URL web app PythonAnywhere kamu.

Hanya file itu yang perlu diedit untuk alamat API.

## 3. Backend

Upload isi folder `backend/` ke PythonAnywhere.

Petunjuk lengkap ada di:

```text
backend/PYTHONANYWHERE_SETUP.txt
```

`backend/.env` sudah berisi username admin dan hash password. Password asli tidak ditulis di file project.

## 4. GitHub Pages

Untuk frontend, upload semuanya KECUALI folder `backend/` bila repo kamu public.

File `CNAME` sudah berisi:

```text
linzzzstoree.my.id
```

## Admin

Halaman admin:

```text
https://linzzzstoree.my.id/linzadmin404/admin.html
```

Nama folder admin hanya menyamarkan URL. Keamanan login tetap dilakukan backend.

## Catatan

QRIS sengaja belum aktif. Saat ini pembayaran menggunakan WhatsApp.
