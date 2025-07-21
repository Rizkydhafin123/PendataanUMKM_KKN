DELETE FROM umkm;
DELETE FROM users;

INSERT INTO users (id, username, name, role, rt, rw) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Ketua RW 01', 'admin', '001', '01'),
('550e8400-e29b-41d4-a716-446655440004', 'admin', 'Ketua RW 04', 'admin', '001', '04')
ON CONFLICT (id) DO NOTHING;

INSERT INTO umkm (
  nama_usaha, pemilik, jenis_usaha, kategori_usaha, status, 
  modal_awal, rab, jumlah_karyawan, user_id, tanggal_daftar
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
  '550e8400-e29b-41d4-a716-446655440001',
  NOW()
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
  '550e8400-e29b-41d4-a716-446655440001',
  NOW()
),
(
  'Bengkel Motor Jaya',
  'Ahmad Jaya',
  'Otomotif',
  'Kecil',
  'Aktif',
  25000000,
  30000000,
  3,
  '550e8400-e29b-41d4-a716-446655440004',
  NOW()
) ON CONFLICT DO NOTHING;
