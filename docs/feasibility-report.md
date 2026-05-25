# Canva Apps SDK Feasibility Report: Native Frame Support

## Tujuan
Memvalidasi kemampuan Canva Apps SDK dalam membuat "native frame" (elemen desain di mana pengguna dapat meletakkan (drag & drop) gambar ke dalamnya sehingga gambar tersebut mengikuti bentuk/topeng dari elemen tersebut).

## Apa yang Dites
Kami melakukan eksperimen dengan Canva Design API, khususnya fungsi `addElementAtPoint`, untuk menyisipkan elemen berjenis `shape`.

**Payload yang Diuji:**
```typescript
await addElementAtPoint({
  type: "shape",
  paths: [{
    d: "...svg path data...",
    fill: {
      dropTarget: true, // Kunci dari pembuatan frame
      color: "#e8e8e8",
    },
  }],
  viewBox: { width, height, top, left }
});
```

## Hasil Test (Berdasarkan Dokumentasi & Eksperimen API)
1. **API `addElementAtPoint` Mendukung Shape:** Ya, Canva Apps SDK secara eksplisit mendukung penyisipan elemen SVG (`type: "shape"`) dengan properti `paths`.
2. **Properti `dropTarget`:** Struktur payload dari tipe data shape memiliki properti `dropTarget` pada objek `fill`. Saat diset ke `true`, elemen vektor tersebut dirancang untuk berfungsi sebagai area drop (frame) di dalam editor Canva.
3. **Editable Vector Fallback:** Jika `dropTarget` gagal atau menghasilkan hasil yang tidak terduga di versi Canva Editor pengguna, fallback ke `dropTarget: false` tetap menyisipkan elemen SVG murni (vektor) yang dapat diubah warnanya dan diubah ukurannya tanpa kehilangan kualitas.

## Kesimpulan
- **Native Frame Memungkinkan:** Berdasarkan tipe data SDK, sangat mungkin untuk secara programatis menghasilkan frame native menggunakan properti `dropTarget: true`.
- **Keterbatasan yang Harus Diperhatikan:**
  - Bentuk SVG yang sangat kompleks dengan banyak path mungkin tidak selalu berperilaku baik sebagai sebuah frame tunggal.
  - Saat ini, MVP kami menggabungkan (flattening) beberapa path dari PNG tracing, yang mungkin tidak selalu menghasilkan satu area drop yang kohesif jika bentuknya terputus-putus.
  - Untuk hasil terbaik, pengguna sangat disarankan untuk menggunakan bentuk silhouette/blob padat atau logo dengan outline sederhana.

## Solusi Fallback
Jika ada kendala SDK atau browser di sisi klien, kami menyediakan opsi ekspor fallback:
- Unduhan file `.svg` mandiri.
- Unduhan file `.pdf` mandiri.
- Pengguna dapat mengunggah file yang diekspor tersebut secara manual melalui tab Unggahan asli Canva (di mana Canva memiliki proses backend sendiri untuk mengevaluasi PDF/SVG sebagai bentuk potensial).
