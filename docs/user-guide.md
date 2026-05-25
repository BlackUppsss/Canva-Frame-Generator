# User Guide — Canva Frame Generator

Selamat datang di Canva Frame Generator! Aplikasi ini membantu Anda mengubah aset Anda menjadi bentuk (shape) dan bingkai (frame) yang dapat diedit langsung di Canva.

## Format File yang Disarankan
- **PNG:** Harus memiliki latar belakang **transparan**. Bentuk/siluet yang solid dan tebal bekerja paling baik.
- **SVG:** Harus berupa grafik vektor murni. Jika Anda memiliki teks, gunakan perangkat lunak desain Anda untuk "Convert to Paths/Outlines" terlebih dahulu.

## Langkah-langkah Penggunaan

### 1. Upload File
- Buka aplikasi dari sidebar Canva.
- Tarik dan lepas (drag & drop) file `.png` atau `.svg` Anda ke area garis putus-putus, atau klik tombol **"Choose PNG or SVG"** untuk menelusuri komputer Anda.
- Jika file terlalu besar atau tidak valid, Anda akan melihat pesan kesalahan berwarna merah.

### 2. Preview & Settings (Hanya untuk PNG)
- Setelah diproses, Anda akan melihat kotak pratinjau.
- Anda dapat beralih antara melihat gambar "Original" (Asli) dan bentuk "Converted" (Terkonversi).
- **Pengaturan Tracing:** Jika Anda mengunggah PNG, Anda dapat menyesuaikan seberapa detail bentuk vektor tersebut:
  - **Trace Threshold:** Mengontrol piksel mana yang dianggap solid vs transparan.
  - **Smoothness:** Angka yang lebih tinggi menciptakan bentuk yang tidak terlalu bergerigi, angka yang lebih rendah menangkap lebih banyak detail.
  - **Invert Mask:** Membalik apa yang akan dipotong.

### 3. Insert to Design
- Klik tombol biru **"Insert to Design"**.
- Tergantung pada pengaturan Anda, ini akan menambahkannya sebagai Frame (di mana Anda dapat menyeret foto di atasnya) atau Vektor solid (di mana Anda dapat mengubah warna secara bebas).

### 4. Ekspor Fallback (Opsional)
- Jika elemen tidak terlihat atau berfungsi sebagaimana mestinya di kanvas, gulir ke bawah ke bagian **"Fallback export"**.
- Anda dapat mengunduh hasilnya sebagai file **SVG** atau **PDF** ke komputer Anda, atau langsung menyalin kodenya.
