# LostNotes - Student Web Portal

Complete Progressive Web Application (PWA) for Student Notes & Campus portal.

## Setup Instructions

### 1. Database (Supabase) Setup
1. Go to your Supabase project dashboard: `https://supabase.com`
2. Open the **SQL Editor** from the left sidebar.
3. Open the `supabase_schema.sql` file in the root of this project.
4. Copy all the contents of `supabase_schema.sql` and paste it into the Supabase SQL Editor.
5. Click **Run** to execute the script. This will create all tables, policies, and storage buckets.

### 2. Local Development

**Run Backend:**
```bash
cd server
npm install
npm run dev
```
*(Note: Start script in package.json is missing `dev`, you can run `node index.js` or add `"dev": "nodemon index.js"`)*

**Run Frontend:**
```bash
cd client
npm install
npm run dev
```

### 3. Deployment

**Deploy Backend to Render:**
1. Create an account on Render (https://render.com).
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` file in the root directory and setup the backend service.

**Deploy Frontend to Vercel:**
1. Create an account on Vercel (https://vercel.com).
2. Connect your GitHub repository.
3. Import the `client` directory as the Root Directory.
4. Set the Framework Preset to `Vite`.
5. Add the Environment Variables:
   - `VITE_SUPABASE_URL` = (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (Your Supabase Anon Key)
   - `VITE_API_URL` = (The URL of your deployed Render backend)
6. Click Deploy.

## Features Included
- Complete Authentication (Signup, Login, Logout)
- Notes Portal (Upload PDF/Images to Supabase Storage, List, Filter)
- Note Request System
- Lost & Found Portal (Report items with images, mark as returned)
- Task Manager (Add, edit status, delete, track deadlines)
- AI Study Tools (Rule-based Fallback Study Planner & Summarizer)
- Dashboard Summary
- Progressive Web App (PWA) Install Prompt

Once deployed on Vercel (which forces HTTPS), visiting the site on mobile or desktop will prompt you to "Install App".
