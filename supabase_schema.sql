-- Supabase Schema for LostNotes

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  year TEXT,
  branch TEXT,
  section TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Notes Table
CREATE TABLE public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., PDF, Handwritten
  module TEXT,
  academic_year TEXT,
  branch TEXT,
  file_url TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Note Requests Table
CREATE TABLE public.note_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  module TEXT,
  description TEXT NOT NULL,
  academic_year TEXT,
  branch TEXT,
  status TEXT DEFAULT 'open', -- open, fulfilled, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Lost & Found Items Table
CREATE TABLE public.lost_found_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'lost' or 'found'
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active', -- active, returned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Tasks Table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  status TEXT DEFAULT 'pending', -- pending, in progress, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Configure Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('notes-files', 'notes-files', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-found-images', 'lost-found-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT DO NOTHING;

-- 8. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Notes Policies (Public read, authenticated create, owner update/delete)
CREATE POLICY "Anyone can view notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload notes" ON public.notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Note Requests Policies
CREATE POLICY "Anyone can view requests" ON public.note_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create requests" ON public.note_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own requests" ON public.note_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own requests" ON public.note_requests FOR DELETE USING (auth.uid() = user_id);

-- Lost & Found Policies
CREATE POLICY "Anyone can view lost & found items" ON public.lost_found_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create lost & found items" ON public.lost_found_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own lost & found items" ON public.lost_found_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lost & found items" ON public.lost_found_items FOR DELETE USING (auth.uid() = user_id);

-- Tasks Policies (Private to user)
CREATE POLICY "Users can manage their own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- Storage Policies
-- Notes Files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'notes-files');
CREATE POLICY "Authenticated users can upload notes files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notes-files' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own notes files" ON storage.objects FOR DELETE USING (bucket_id = 'notes-files' AND auth.uid() = owner);

-- Lost & Found Images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'lost-found-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lost-found-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'lost-found-images' AND auth.uid() = owner);

-- Profile Images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload their own profile image" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid() = owner);
CREATE POLICY "Users can update their own profile image" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own profile image" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid() = owner);

-- Trigger to create a user in public.users when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Student'), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
