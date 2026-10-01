# Portofolio Muhammad Widi Assiddiqy

- `index.html` halaman publik (hanya lihat & scroll)
- `owner.js` editor khusus owner (dimuat hanya jika membuka `.../Portofolio/#owner`)
- `data/works.json` isi karya & urutan sub bab (ini yang diubah editor)
- `assets/` foto

## Cara jadi owner (sekali saja)
1. GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
2. Repository access: Only select repositories > Portofolio. Permissions > Repository permissions > **Contents: Read and write**. Atur masa berlaku, lalu Generate.
3. Buka `https://wiidiia2205-coder.github.io/Portofolio/#owner`, tempel token (jangan dibagikan ke siapa pun).
4. Tambah/edit/hapus karya, geser (drag) foto, atur urutan sub bab, lalu klik **Simpan**. Pengunjung melihat hasilnya 1-2 menit kemudian.

Keamanan: simpan hanya bisa jika memiliki token milik owner (dicek oleh GitHub). Pengunjung lain tidak bisa mengubah apa pun.
