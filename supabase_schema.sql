-- ==========================================================

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

-- Remove generic policies from previous attempts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload notes files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own notes files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

-- ----------------------------------------------------------
-- NOTES FILES BUCKET
-- ----------------------------------------------------------

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

-- ----------------------------------------------------------
-- LOST & FOUND IMAGES BUCKET
-- ----------------------------------------------------------

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

-- ----------------------------------------------------------
-- PROFILE IMAGES BUCKET
-- ----------------------------------------------------------

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
