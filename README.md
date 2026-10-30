# رابعة طب — Premium Medical Study Planner

A luxurious, high-performance medical study management platform purpose-built for fourth-year medical students. Designed to streamline curriculum tracking, lecture mastery, dynamic countdowns, dual Gregorian/Hijri calendar scheduling, daily clinical tasks, and real-data topic progression analytics.

---

## 🌟 Key Highlights & Features

- **Exclusive 4th-Year Medical Curriculum Preloaded:**
  - **Pediatrics:** 16 branches (Neonatology, Nutritional Disorders, Respiratory, Hematology, Gastroenterology, Cardiology, Nephrology, Neurology, Endocrine & Adolescent Medicine, Infectious Diseases, Allergy, Rheumatology, Immunology, Oncology, Genetics, Hepatology) spanning 45 high-yield lectures.
  - **Anesthesia:** General Anesthesia & Perioperative Care (11 lectures).
  - **Psychiatry:** Comprehensive Psychiatry Topics (10 lectures).
  - **Tropical Medicine:** Infectious & Tropical Medicine Topics (17 lectures).
  - **Rheumatology:** Autoimmune & Connective Tissue Diseases (6 lectures).
- **Interactive Multi-View Calendar:**
  - Month, Week, and Day interactive views.
  - **Gregorian Primary & Umm al-Qura Hijri Secondary:** Standardized via `Intl.DateTimeFormat` with `islamic-umalqura` calendar.
  - Side panel for day inspection with task counters and one-click task scheduling.
- **Dynamic Subject-to-Task Cascading Linker:**
  - Selecting a Subject filters the Branches dropdown.
  - Selecting a Branch filters the Lectures dropdown.
  - Selecting a Lecture automatically populates the task title and links curriculum progress.
  - Create free-form clinical tasks (e.g. "Solve 50 MCQs", "Revise ECG Criteria") with zero friction.
- **Daily Tasks Agenda ("What do I have to do today?"):**
  - Dedicated agenda answering what needs to be studied today.
  - Automatic Overdue section for incomplete prior tasks.
  - Yesterday / Tomorrow navigation stepper.
- **Dynamic Examination Countdown:**
  - Large live seconds countdown targeted to **19 February 2027** (or user-customized board date).
  - Built-in date & time picker that updates immediately across the platform.
- **Topic Progression & Analytics:**
  - 100% real-data metrics (no simulated values or hardcoded charts).
  - GitHub-style study activity heatmap displaying daily completion intensity.
  - Consecutive active study day streak and longest streak tracker.
  - Subject mastery comparison bars with branch-level drilldown.
  - Smart clinical study insights derived from actual completion velocity.
- **Google Account Authentication & Cross-Device Synchronization (NEW):**
  - Seamless "Continue with Google" sign-in via Firebase Authentication.
  - Real-time cross-device cloud sync with Cloud Firestore: study across desktop, laptop, tablet, and smartphone.
  - Strict per-user private data isolation: each Google account owns its private study record.
  - First-login automatic local data migration with duplicate prevention.
  - Offline resilience with local caching.
- **Offline Persistence & Zero-Backend Privacy:**
  - Runs 100% on vanilla HTML5, CSS3, and JavaScript.
  - Data saved to `localStorage` with defensive error handling and stable IDs.
  - Full JSON backup export and restore with validation.
  - Factory reset option with confirmation safeguards.
- **Visual Identity:**
  - Bespoke dark navy (`#101827`) and muted gold (`#C99A2E`) aesthetic.
  - Architectural geometric "4" logo and matching vector favicon.
  - Right-side persistent collapsible sidebar (desktop LTR) and bottom drawer (mobile).
  - Responsive across smartphones, tablets, and ultra-wide desktops.

---

## 📁 Directory Structure

```text
/
├── index.html              # Main single-page application entry point & login overlay
├── README.md               # Documentation and GitHub Pages deployment guide
├── firestore.rules         # Strict user-isolated Firestore Security Rules
├── assets/
│   ├── logo.svg            # Distinctive geometric '4' logo
│   └── favicon.svg         # Matching browser favicon
├── css/
│   └── styles.css          # Core CSS variables, layout, animations & authentication styles
└── js/
    ├── firebase-config.js  # Firebase configuration and credentials loader
    ├── auth.js             # Google Authentication Manager (Sign in with Google, Sign Out)
    ├── sync.js             # Firestore real-time cross-device sync & data migration
    ├── data.js             # Initial 5 subjects, branches, 89 lectures & default settings
    ├── icons.js            # Scalable SVG icon library with Google & cloud symbols
    ├── date-utils.js       # Gregorian & Umm al-Qura Hijri date engine & streak counter
    ├── storage.js          # LocalStorage manager, cloud hook, backup export/import
    ├── subjects.js         # Curriculum manager, branch management & lecture editor
    ├── tasks.js            # Task controller & Daily Tasks agenda view
    ├── calendar.js         # Month/Week/Day interactive calendar
    ├── dashboard.js        # Main dashboard, live exam countdown & summary tiles
    ├── analytics.js        # Topic Progression, SVG charts & activity heatmap
    ├── settings.js         # Examination date editor, account sync, density & data management
    └── app.js              # Application orchestrator, modal system & toast notifications
```

---

## ☁️ Firebase Authentication & Firestore Setup Guide

Follow these simple steps in the [Firebase Console](https://console.firebase.google.com/) to link your Google project:

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add project** (e.g. name it `rabia-med-planner`).
2. Google Analytics can be enabled or disabled as you prefer. Click **Create project**.

### Step 2: Register a Web Application
1. In your Firebase Project Overview, click the Web icon (`</>`) to add a web app.
2. Enter an app nickname (e.g. `Rabia Med Web`) and click **Register app**.
3. You will see a `firebaseConfig` object with your keys:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "rabia-med-planner.firebaseapp.com",
     projectId: "rabia-med-planner",
     storageBucket: "rabia-med-planner.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
4. Paste these values into [js/firebase-config.js](file:///c:/MED/js/firebase-config.js) or paste them directly inside the app using the **Configure Firebase Project Keys** button on the login screen or in **Settings**.

### Step 3: Enable Google Sign-In Provider
1. In the Firebase Console left navigation menu, go to **Build** > **Authentication**.
2. Click **Get Started** if prompted.
3. In the **Sign-in method** tab, click **Google**.
4. Toggle the **Enable** switch.
5. Choose your Project public-facing name (e.g. `رابعة طب`) and select your Project support email.
6. Click **Save**.

### Step 4: Configure Authorized Domains
1. Still under **Authentication**, go to the **Settings** tab > **Authorized domains**.
2. By default, `localhost` and `*.firebaseapp.com` are already authorized.
3. If you deploy to GitHub Pages (e.g., `<your-username>.github.io`) or a custom domain, click **Add domain** and enter your hostname (e.g. `<your-username>.github.io`).

### Step 5: Enable Cloud Firestore & Apply Security Rules
1. In the left navigation menu, go to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Select your preferred Cloud Firestore location (e.g., `europe-west` or `nam5 (us-central)`).
4. Start in **Production mode** and click **Create**.
5. Once created, click the **Rules** tab at the top.
6. Replace the default rules with the rules from [firestore.rules](file:///c:/MED/firestore.rules):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /{allSubcollections=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
7. Click **Publish**.

Now your application will securely authenticate users with Google and automatically sync all curriculum progress, calendar schedules, and tasks in real time across any number of devices!

---

## 🚀 Running Locally

Because this application uses standard static files, you can run it immediately without compiling or installing Node packages:

### Option 1: Any Local Static HTTP Server (Recommended)
Using Python (preinstalled on most computers):
```bash
# In the project directory
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your web browser.

### Option 2: Node http-server or npx serve
```bash
npx serve .
```

### Option 3: Direct File Opening
Double-click `index.html` to open it in your browser. (All relative paths and localStorage work in modern browsers).

---

## 🌐 Deploying to GitHub Pages

Deploying takes under 2 minutes:

1. Create a new GitHub repository (e.g. `rabia-tab-planner`).
2. Push your project files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of رابعة طب Medical Study Planner"
   git branch -M main
   git remote add origin https://github.com/<your-username>/rabia-tab-planner.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Navigate to **Settings** > **Pages** (under the "Code and automation" section).
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select branch: `main`, folder: `/ (root)`.
   - Click **Save**.
4. GitHub Pages will build and deploy your site within 60 seconds at:
   `https://<your-username>.github.io/rabia-tab-planner/`

---

## 🛡️ Data Backup & Privacy Reminder

All data is stored directly in your browser's `localStorage`:
- No clinical information or study schedules leave your device.
- To transfer your data between devices or share your setup with classmates, open **Settings** > **Export Data (JSON)**.
- Use **Import Backup File** on any other device to instantly restore all subjects, progress, and tasks.

---

## ⚖️ License

MIT License. Designed with excellence for 4th-year medical students.

