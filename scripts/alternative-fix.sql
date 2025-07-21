-- Jika masih error, coba dengan kolom minimal
DELETE FROM umkm;
DELETE FROM users;

-- Insert hanya dengan kolom yang pasti ada
INSERT INTO users (id, username, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin'),
('550e8400-e29b-41d4-a716-446655440004', 'admin', 'admin');

-- Update kolom lain jika ada
UPDATE users SET name = 'Ketua RW 01', rw = '01' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE users SET name = 'Ketua RW 04', rw = '04' WHERE id = '550e8400-e29b-41d4-a716-446655440004';
