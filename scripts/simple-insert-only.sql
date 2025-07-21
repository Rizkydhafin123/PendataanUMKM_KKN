-- Jika tabel users sudah ada, langsung insert data saja
-- Hapus data lama
DELETE FROM umkm WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004');
DELETE FROM users WHERE id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004');

-- Insert admin users (gunakan kolom yang pasti ada)
INSERT INTO users (id, username, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin_rw01', 'admin'),
('550e8400-e29b-41d4-a716-446655440004', 'admin_rw04', 'admin');

-- Insert sample UMKM data
INSERT INTO umkm (
  nama_usaha, 
  pemilik, 
  jenis_usaha, 
  status, 
  modal_awal, 
  rab, 
  jumlah_karyawan, 
  user_id
) VALUES 
(
  'Warung Makan Bu Sari',
  'Sari Dewi',
  'Kuliner',
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
  'Aktif',
  10000000,
  15000000,
  1,
  '550e8400-e29b-41d4-a716-446655440001'
);
