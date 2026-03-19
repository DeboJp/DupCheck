# DupCheck
**The Invisible Guardian for Job Seekers.** 

DupCheck is a Chrome extension engineered to track your job application history and protect you from applying to the exact same role twice. When on, it monitors your active tabs and alerts you to duplicate applications using heuristic URL checking, right inside your browser.

---

# Purpose

Companies often post multiple times for the same role on different platforms or across weeks. There is also this expectation that as jobseekers we should avoid applying to the same role twice, in quick succession. And there is good reason to that. However, as a jobseeker I dont often have the time or resources to keep track of duplicate applications. There are many indepth jobtrackers in the market, and some job portals prevent duplicates directly, but many dont. DupCheck is built purposefully for the sole objective of reducing duplicate applications. I have faced this issue myself, where recruiters have personally reached out to me to kindly ask to withdraw, to let me know that I have already applied for the role, or to apply at a later date. Personally, as a jobseeker, I feel for these recruiters, and I would like to avoid such situations in the future, and in the worst case be blacklisted due to spamming. Hopefully in the future all job portals will have this feature built-in, but for now and for those who are feeling the same issue, DupCheck is here to help.

---

## Capabilities

- **Algorithmic Duplicate Prevention**: Tracks URLs locally and intelligently detects duplicates using Levenshtein distance and domain-level comparison.
- **Contextual Overlays**: Smart, non-intrusive toasts inject natively into complex SPAs (like LinkedIn or Workday) to render active historical match previews exactly when you need them.
- **Visual URL Diffing**: Instantly compare current URLs against your saved history with dynamic color-coding matching (`.char-match`) and non-matching characters (`.char-diff`).
- **Data Ownership**: Your data never leaves your machine. Export your complete categorized tracking database strictly to a local CSV with a single click.

---

## Local Setup

DupCheck is currently in pre-release. You can install it locally via Chrome Developer Mode:

1. Navigate to `chrome://extensions/` in Google Chrome.
2. Toggle **Developer mode** `ON` (top right corner).
3. Click **Load unpacked**.
4. Select your local DupCheck directory (e.g., `/DupCheck Chome Extention/`).
5. **Pin** the extension to your toolbar to access live daily application metrics and view your localized tracking history.

---

## Privacy & Architecture

*DupCheck is fundamentally private by design. Zero remote servers are utilized.* 
All execution and data persistence happens exclusively within your browser's local `chrome.storage.local` environment.

**Core Permissions Requirements**:
- `storage`: Essential for confidentially persisting your application URLs over time.
- `tabs` & `activeTab`: Required to securely inspect your active tab's URL to compare against the local database.
- `scripting`: Required to inject the isolated DupCheck CSS/JS Contextual Overlay directly onto job portals.
- `<all_urls>`: Necessary to intercept job applications seamlessly, as job tracking portals are highly fragmented and unpredictable across the web.

---

*May your applications be unique and your offers plentiful. Happy hunting!*
