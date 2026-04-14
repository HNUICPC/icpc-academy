# 🧠 ICPC Academy

**Production-ready competitive programming training platform for ECPC preparation.**

---

## 📁 Project Structure

```
icpc-academy/
├── index.html                    # Landing page / auth redirect
├── firebase.json                 # Firebase Hosting config
├── firestore.rules               # Firestore security rules (production)
├── firestore.indexes.json        # Composite index definitions
│
├── css/
│   ├── main.css                  # Full design system
│   ├── auth.css                  # Auth pages styles
│   └── admin.css                 # Admin panel styles
│
├── js/
│   ├── core/
│   │   ├── firebase-config.js    # Firebase initialization
│   │   └── utils.js              # Badges, streaks, progress, notifications
│   ├── auth/
│   │   └── auth.js               # Auth flows (register, login, guards)
│   └── dashboard/
│       └── components.js         # Navbar, sidebar, toast system
│
└── pages/
    ├── login.html                 # Login page
    ├── register.html              # Registration page
    ├── dashboard.html             # Main user dashboard
    ├── course.html                # Course viewer (levels/weeks/sections)
    ├── leaderboard.html           # Leaderboard page
    ├── profile.html               # User profile & badges
    └── admin.html                 # Full admin panel
```

---

## 🔧 Firebase Setup Guide

### Step 1 — Enable Firebase Services

In your [Firebase Console](https://console.firebase.google.com/project/icpc-academy-388f8):

1. **Authentication** → Sign-in method → Enable **Email/Password**
2. **Firestore Database** → Create database → Start in **production mode**
3. **Hosting** → Get started (follow CLI prompts)

---

### Step 2 — Deploy Firestore Security Rules

In Firebase Console → Firestore → **Rules**, paste the contents of `firestore.rules`.

Or via CLI:
```bash
firebase deploy --only firestore:rules
```

---

### Step 3 — Create Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

Or manually create these composite indexes in Firebase Console:

| Collection      | Fields                              |
|-----------------|-------------------------------------|
| `notifications` | `uid` ASC, `createdAt` DESC         |
| `weeks`         | `levelId` ASC, `order` ASC          |
| `sections`      | `weekId` ASC, `order` ASC           |
| `users`         | `currentWeek` DESC, `streak` DESC   |

---

### Step 4 — Set Admin Claims (External Script)

Since admin logic uses **Firebase Custom Claims** only, run this Node.js script to promote a user:

```js
// set-admin.js  (run with Node.js + Firebase Admin SDK)
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json'); // download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdmin(email) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`✅ Admin granted to: ${email}`);
}

// Usage: node set-admin.js
setAdmin('youremail@example.com');
```

**To get service account key:**
Firebase Console → Project Settings → Service Accounts → Generate New Private Key

---

## 🚀 Deployment Guide

### Option A — Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project: icpc-academy-388f8)
firebase init hosting

# Deploy
firebase deploy
```

Your site will be live at:
- `https://icpc-academy-388f8.web.app`
- `https://icpc-academy-388f8.firebaseapp.com`

---

### Option B — GitHub Pages

1. Push repo to GitHub
2. Go to repo Settings → Pages
3. Set source to **main branch**, root `/`
4. Update `firebase.json` to remove rewrites (not needed for static GitHub Pages)

> ⚠️ Firebase Hosting is strongly recommended for proper SPA routing.

---

### Option C — GitHub + Firebase CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: FirebaseExtended/action-firebase-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: icpc-academy-388f8
```

---

## 🗄️ Firestore Database Schema

### `users/{uid}`
```json
{
  "email": "user@example.com",
  "codeforcesHandle": "tourist",
  "currentLevel": 0,
  "currentWeek": 1,
  "streak": 7,
  "lastActivity": "Timestamp",
  "badges": ["first_login", "streak_7"],
  "progress": {
    "levelId_weekId_sectionId": true
  },
  "createdAt": "Timestamp"
}
```

### `levels/{levelId}`
```json
{
  "title": "Level 0 - Beginner",
  "description": "Introduction to competitive programming",
  "order": 0,
  "createdAt": "Timestamp"
}
```

### `weeks/{weekId}`
```json
{
  "title": "Week 1 - Getting Started",
  "description": "Setting up and first problems",
  "levelId": "levelId",
  "order": 1,
  "createdAt": "Timestamp"
}
```

### `sections/{sectionId}`
```json
{
  "title": "Introduction to STL",
  "type": "video",
  "weekId": "weekId",
  "url": "https://youtube.com/watch?v=...",
  "order": 1,
  "createdAt": "Timestamp"
}
```

Section types:
- **video**: `{ type: "video", url: "youtube URL" }`
- **link**: `{ type: "link", links: [{ url, label }] }`
- **note**: `{ type: "note", content: "HTML string" }`

### `notifications/{notifId}`
```json
{
  "uid": "userId",
  "type": "warning | announcement | progress",
  "title": "Notification Title",
  "message": "Message body",
  "read": false,
  "createdAt": "Timestamp"
}
```

---

## 🏅 Badges Reference

| ID              | Icon | Label           | Trigger                    |
|-----------------|------|-----------------|----------------------------|
| `first_login`   | 🚀   | First Login     | First successful login     |
| `first_week`    | 📖   | Week Warrior    | Complete first week        |
| `streak_7`      | 🔥   | 7-Day Streak    | Reach 7-day streak         |
| `streak_30`     | ⚡   | 30-Day Streak   | Reach 30-day streak        |
| `level_complete`| 🏆   | Level Master    | Complete a full level      |
| `perfect_week`  | 💎   | Perfect Week    | 100% week completion       |
| `early_bird`    | 🌅   | Early Bird      | Login before 7 AM          |
| `night_owl`     | 🦉   | Night Owl       | Study past midnight        |

---

## 🔐 Security Summary

| Resource        | Public | Authenticated | Admin Only |
|-----------------|--------|---------------|------------|
| `levels`        | ❌     | Read ✅       | Write ✅   |
| `weeks`         | ❌     | Read ✅       | Write ✅   |
| `sections`      | ❌     | Read ✅       | Write ✅   |
| `users`         | ❌     | Own data ✅   | All ✅     |
| `notifications` | ❌     | Own only ✅   | All ✅     |

Admin is determined **exclusively** by Firebase Custom Claims `claims.admin === true`.
No Firestore role field is used.

---

## ⚡ First-Time Setup Checklist

- [ ] Firebase Auth: Email/Password enabled
- [ ] Firestore: Created in production mode
- [ ] Deploy `firestore.rules`
- [ ] Deploy `firestore.indexes.json`
- [ ] Set admin claims on first admin user via Node.js script
- [ ] Deploy to Firebase Hosting
- [ ] Add first Level via Admin Panel
- [ ] Add Weeks to that Level
- [ ] Add Sections to each Week
- [ ] Share registration link with students

---

## 🧑‍💻 Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Frontend    | HTML5 + CSS3 + Vanilla JS   |
| Auth        | Firebase Authentication     |
| Database    | Cloud Firestore             |
| Hosting     | Firebase Hosting            |
| Admin SDK   | Node.js (external script)   |
| Fonts       | Cairo, Almarai, Space Mono  |
| CF Validate | Codeforces Public API       |
