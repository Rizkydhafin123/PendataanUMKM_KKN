-- Hapus data lama terlebih dahulu
DELETE FROM umkm;
DELETE FROM users;

-- Insert admin users dengan kolom yang benar (sesuaikan dengan struktur tabel yang ada)
INSERT INTO users (id, username, name, role, rw) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Ketua RW 01', 'admin', '01'),
('550e8400-e29b-41d4-a716-446655440004', 'admin', 'Ketua RW 04', 'admin', '04');

-- Insert sample UMKM data
INSERT INTO umkm (
  nama_usaha, pemilik, jenis_usaha, kategori_usaha, status, 
  modal_awal, rab, jumlah_karyawan, user_id
) VALUES 
(
  'Warung Makan Bu Sari',
  'Sari Dewi',
  'Kuliner',
  'Mikro',
  'Aktif',
  5000000,
  7000000,
  2,
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  'Toko Kelontong Pak Budi',
  'Budi Santoso',
  'Perdagangan',
  'Mikro',
  'Aktif',
  10000000,
  15000000,
  1,
  '550e8400-e29b-41d4-a716-446655440001'
);
