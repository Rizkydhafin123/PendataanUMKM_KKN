-- Hapus data lama
DELETE FROM umkm;
DELETE FROM users;

-- Insert admin users (sesuaikan dengan struktur tabel users yang ada)
-- Jika tabel users belum ada, buat dulu
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  rw VARCHAR(2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin users
INSERT INTO users (id, username, name, role, rw) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Ketua RW 01', 'admin', '01'),
('550e8400-e29b-41d4-a716-446655440004', 'admin', 'Ketua RW 04', 'admin', '04')
ON CONFLICT (username) DO NOTHING;

-- Insert sample UMKM data (sesuai dengan struktur tabel yang ada)
INSERT INTO umkm (
  nama_usaha, 
  pemilik, 
  jenis_usaha, 
  kategori_usaha, 
  status, 
  modal_awal, 
  rab, 
  jumlah_karyawan, 
  user_id,
  tanggal_daftar
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
);
