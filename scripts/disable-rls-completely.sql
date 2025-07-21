-- Disable RLS completely untuk development
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS umkm DISABLE ROW LEVEL SECURITY;

-- Drop semua policies yang ada
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admin can see all UMKM data" ON umkm;
DROP POLICY IF EXISTS "Users can see their own UMKM data" ON umkm;
DROP POLICY IF EXISTS "Allow all operations on umkm" ON umkm;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
