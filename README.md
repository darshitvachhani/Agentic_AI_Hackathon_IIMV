# Academic Business Strategy Simulation Platform

A full-screen, conversational business simulation platform for MBA students and faculty, featuring an 8-quarter decision cycle across India-focused startup sectors with Gemini AI facilitation and quantitative scoring.

---

## 🚀 How to Deploy on Netlify (No Database Needed)

This application is **100% serverless and client-state driven**. It does not need any database or server maintenance.

### Step 1: Push to GitHub
Push this project folder to your GitHub account:
```bash
git init
git add .
git commit -m "Initial commit for Netlify deployment"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

---

### Step 2: Connect to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and select your simulation repository.

---

### Step 3: Configure Build & Environment Variable
Netlify will automatically detect the configuration from `netlify.toml`:
- **Build command:** *(leave empty)*
- **Publish directory:** `.` (root)
- **Functions directory:** `netlify/functions`

Now add your Gemini API Key:
1. Under **Environment variables**, click **Add a variable**.
2. **Key:** `GEMINI_API_KEY`
3. **Value:** `Your_Google_Gemini_API_Key` *(e.g. AIzaSy...)*
4. *(Optional)* **GEMINI_MODEL:** `gemini-2.5-flash`

Click **Deploy site**.

---

### Step 4: Live URL
In 30 seconds, Netlify will generate your public live URL (e.g. `https://your-site-name.netlify.app`), completely functional with:
- Edge CDN delivery of all frontend assets.
- Serverless API proxying via Netlify Functions (`/api/chat`, `/api/simulate-quarter`, `/api/status`).
- Zero database maintenance.
- 100% Free tier eligible.

---

## 💻 Local Development (Alternative)
You can still run and test locally at any time using:
```bash
python3 server.py 3000
```
Then open `http://localhost:3000`.
