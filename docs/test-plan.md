# Test Plan — Canva Frame Generator

Dokumen ini menguraikan skenario pengujian utama untuk memastikan keandalan aplikasi.

## 1. Pengujian Input File (FileDropzone)
| Test Case | Langkah | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| Unggah SVG yang valid | Seret file `.svg` sederhana ke zona pelepasan | File diterima, informasi file ditampilkan, beralih ke UI Pratinjau. |
| Unggah PNG transparan yang valid | Seret file `.png` transparan | Diterima, diuraikan, panel pratinjau dan pengaturan tracer PNG muncul. |
| Unggah Format Tidak Valid | Unggah `.jpg` atau `.gif` | Kesalahan: "Only PNG and SVG files are supported." |
| Unggah File Besar (>5MB) | Unggah SVG 6MB | Kesalahan ukuran file mencegah pemrosesan. |

## 2. Pemrosesan & Konversi
| Test Case | Langkah | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| Peringatan PNG Non-Transparan | Unggah PNG yang sepenuhnya buram (tanpa saluran alfa) | Peringatan ditampilkan: "This PNG has no transparent area..." |
| SVG Kompleks | Unggah SVG dengan tag `<text>` atau `<image>` | Parsing berhasil tetapi peringatan ditampilkan bahwa fitur kompleks mungkin diabaikan. |
| Penyesuaian Pengaturan Tracing | Ubah slider Threshold atau Smoothness untuk SVG | Pratinjau SVG harus diperbarui secara reaktif untuk mencerminkan batas jalur yang lebih baru/lebih halus. |

## 3. UI Pratinjau
| Test Case | Langkah | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| Toggle Original/Converted | Klik tab di panel pratinjau | Tampilan beralih antara pratinjau piksel asli dan hasil rendisi `dangerouslySetInnerHTML` SVG. |

## 4. Integrasi Canva SDK (InsertButton)
| Test Case | Langkah | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| Penyisipan Native Frame | Klik "Insert to Design" (Mode Auto/Frame) | Pesan sukses. Elemen muncul di kanvas Canva. Pengguna dapat menyeret gambar saham Canva dan itu masuk (snaps) ke dalam batas elemen. |
| Penyisipan Vector Fallback | Ubah pengaturan mode output ke "Vector" dan sisipkan | Muncul di kanvas. Memilih elemen akan menyoroti opsi warna solid di editor Canva (bukan placeholder gambar bingkai). |

## 5. Ekspor Fallback
| Test Case | Langkah | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| Download SVG | Klik Download SVG | Prompt unduhan file terpicu. File dapat dibuka di browser/Illustrator. |
| Download PDF | Klik Download PDF | PDF yang dibuat oleh jsPDF diunduh yang berisi jalur vektor vektor. |
| Copy Code | Klik Copy SVG code | Teks clipboard diperbarui dengan `<svg>` DOM utuh. |
