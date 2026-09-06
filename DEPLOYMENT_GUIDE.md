# 🌐 CivicGrid AI — Free Cloud Hosting & Deployment Guide

This guide details how to deploy CivicGrid AI to **Free Global Cloud Hosting** using **Firebase Hosting** (Google Cloud Global CDN) and optionally **Vercel**.

---

## Option 1: Firebase Hosting (Google Cloud Global CDN) — 100% Free

Firebase Hosting gives you free SSL, custom domains, and automatic high-speed CDN distribution on `*.web.app` and `*.firebaseapp.com`.

### Step 1: Create a Free Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. Name your project (e.g. `civicgrid-ai-prod` or your team name).
3. Disable Google Analytics (optional) and click **Create Project**.
4. In the Project Overview, click the **Web icon (`</>`)** to register your web app.
5. Check the box **"Also set up Firebase Hosting for this app"**.
6. Copy the `firebaseConfig` keys into your `.env` file (see `.env.example`).

### Step 2: Enable Firebase Authentication (Google & Email)
1. In Firebase Console, go to **Build > Authentication > Get Started**.
2. Under the **Sign-in method** tab:
   - Enable **Google** (set your support email and click Save).
   - Enable **Email/Password** and click Save.
   - Enable **Anonymous** (optional for instant guest testing).

### Step 3: Deploy in One Command
From the project root:

```bash
# 1. Login to Firebase CLI (opens your browser to authenticate)
npx -y firebase-tools login

# 2. Build the production bundle
npm run build

# 3. Associate your project (if not already set in .firebaserc)
npx -y firebase-tools use --add <your-firebase-project-id>

# 4. Deploy to free Google Cloud Hosting
npx -y firebase-tools deploy --only hosting
```

Your app will immediately be live at:
`https://<your-project-id>.web.app` and `https://<your-project-id>.firebaseapp.com`!

---

## Option 2: Vercel (Alternative 1-Click Free Hosting)

If you prefer Vercel:
1. Run:
   ```bash
   npx -y vercel
   ```
2. Follow the 3 prompts (default settings work automatically).
3. For production release:
   ```bash
   npx -y vercel --prod
   ```

---

## Local Testing with Firebase Hosting Emulator

To preview your Firebase Hosting build locally before publishing:
```bash
npm run build
npx -y firebase-tools emulators:start --only hosting
```
Visit `http://127.0.0.1:5000` to inspect the production CDN bundle locally.
