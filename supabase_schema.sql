LOSTNOTES / UNIHUB - FINAL SUPABASE SCHEMA
-- Safe to run multiple times.
-- Fixes:
--   - bucket not found
--   - policy already exists
--   - must be owner of table objects
--   - missing tables and trigger
-- ==========================================================

-- ----------------------------------------------------------
-- 1. Enable UUID Extension
-- ----------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 2. Create Users Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Student',
  email TEXT UNIQUE NOT NULL,
  year TEXT,
  branch TEXT,
  section TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------
-- 3. Create Notes Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  module TEXT,
  academic_year TEXT,
  branch TEXT,
  file_url TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------
-- 4. Create Note Requests Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.note_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  module TEXT,
  description TEXT NOT NULL,
  academic_year TEXT,
  branch TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------
-- 5. Create Lost & Found Items Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lost_found_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,            -- 'lost' or 'found'
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active',  -- 'active' or 'returned'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------
-- 6. Create Tasks Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------
-- 7. Create Storage Buckets
-- ----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes-files', 'notes-files', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-found-images', 'lost-found-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- 8. Enable RLS on Application Tables
-- ----------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- 9. Drop Existing Policies (Safe Re-run)
-- ----------------------------------------------------------

-- Users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Notes
DROP POLICY IF EXISTS "Anyone can view notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can upload notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Note Requests
DROP POLICY IF EXISTS "Anyone can view requests" ON public.note_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.note_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON public.note_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON public.note_requests;

-- Lost & Found
DROP POLICY IF EXISTS "Anyone can view lost & found items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Authenticated users can create lost & found items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Users can update their own lost & found items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Users can delete their own lost & found items" ON public.lost_found_items;

-- Tasks
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;

-- Storage policies
DROP POLICY IF EXISTS "Public Access Notes Files" ON storage.objects;
DROP POLICY IF EXISTS "Upload Notes Files" ON storage.objects;
DROP POLICY IF EXISTS "Delete Notes Files" ON storage.objects;

DROP POLICY IF EXISTS "Public Access Lost Found Images" ON storage.objects;
DROP POLICY IF EXISTS "Upload Lost Found Images" ON storage.objects;
DROP POLICY IF EXISTS "Delete Lost Found Images" ON storage.objects;

DROP POLICY IF EXISTS "Public Access Profile Images" ON storage.objects;
DROP POLICY IF EXISTS "Upload Profile Images" ON storage.objects;
DROP POLICY IF EXISTS "Update Profile Images" ON storage.objects;
DROP POLICY IF EXISTS "Delete Profile Images" ON storage.objects;

-- Legacy generic policy names from previous attempts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload notes files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own notes files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

-- ----------------------------------------------------------
-- 10. Create Application Table Policies
-- ----------------------------------------------------------

-- Users
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Notes
CREATE POLICY "Anyone can view notes"
ON public.notes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload notes"
ON public.notes
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notes"
ON public.notes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.notes
FOR DELETE
USING (auth.uid() = user_id);

-- Note Requests
CREATE POLICY "Anyone can view requests"
ON public.note_requests
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create requests"
ON public.note_requests
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own requests"
ON public.note_requests
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests"
ON public.note_requests
FOR DELETE
USING (auth.uid() = user_id);

-- Lost & Found
CREATE POLICY "Anyone can view lost & found items"
ON public.lost_found_items
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create lost & found items"
ON public.lost_found_items
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own lost & found items"
ON public.lost_found_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost & found items"
ON public.lost_found_items
FOR DELETE
USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can manage their own tasks"
ON public.tasks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 11. Create Storage Policies
-- ----------------------------------------------------------

-- Notes Files
CREATE POLICY "Public Access Notes Files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'notes-files');

CREATE POLICY "Upload Notes Files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'notes-files'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Delete Notes Files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'notes-files'
  AND auth.uid() = owner
);

-- Lost & Found Images
CREATE POLICY "Public Access Lost Found Images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lost-found-images');

CREATE POLICY "Upload Lost Found Images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'lost-found-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Delete Lost Found Images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'lost-found-images'
  AND auth.uid() = owner
);

-- Profile Images
CREATE POLICY "Public Access Profile Images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Upload Profile Images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.uid() = owner
);

CREATE POLICY "Update Profile Images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.uid() = owner
);

CREATE POLICY "Delete Profile Images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.uid() = owner
);

-- ----------------------------------------------------------
-- 12. Create Trigger for New Auth Users
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
