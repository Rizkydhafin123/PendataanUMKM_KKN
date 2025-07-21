-- Cek struktur tabel users yang sudah ada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Cek struktur tabel umkm
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'umkm' 
ORDER BY ordinal_position;
