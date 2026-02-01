-- ADUAN RAKYAT PWA - SUPABASE DATABASE SETUP
-- Salin dan jalankan skrip ini di Supabase SQL Editor

-- 1. JADUAL PROFILES (Menyimpan maklumat user & gamifikasi)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user', -- 'user' atau 'admin'
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. JADUAL REPORTS (Menyimpan aduan)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'open', -- 'open', 'acknowledged', 'in_progress', 'closed'
  is_hidden BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES reports(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. JADUAL REPORT_UPDATES (Kronologi status aduan)
CREATE TABLE IF NOT EXISTS report_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. JADUAL COMMENTS (Komen komuniti)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. JADUAL REPORT_FOLLOWERS (Sistem follow aduan)
CREATE TABLE IF NOT EXISTS report_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(report_id, user_id)
);

-- 6. TRIGGER: AUTO-CREATE PROFILE (Apabila user baru signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. RPC FUNCTION: INCREMENT_POINTS (Untuk sistem gamifikasi)
CREATE OR REPLACE FUNCTION increment_points(user_id UUID, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET points = points + points_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. STORAGE SETUP (Sila namakan bucket 'report-images' di Dashboard)
-- Pastikan anda pergi ke Dashboard > Storage > Create Bucket: name it "report-images"
-- Set Privacy: Public

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_followers ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Reports
CREATE POLICY "Reports are viewable by everyone" ON reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reports" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update all reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for Updates/Comments
CREATE POLICY "Updates/Comments viewable by everyone" ON report_updates FOR SELECT USING (true);
CREATE POLICY "Updates/Comments viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for Followers
CREATE POLICY "Followers viewable by everyone" ON report_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow reports" ON report_followers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
