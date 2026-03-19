# DupCheck
**The Invisible Guardian for Job Seekers.** 

DupCheck is a Chrome extension engineered to track your job application history and protect you from applying to the exact same role twice. When on, it monitors your active tabs and alerts you to duplicate applications using heuristic URL checking, right inside your browser.

---

# Why DupCheck

The modern job search is chaotic. Companies often repost the same role or link over several weeks, making it difficult to remember exactly what you’ve already applied to.

I built DupCheck out of personal frustration. I’ve had recruiters reach out to kindly ask me to withdraw an application because I had inadvertently submitted for the same role twice. It’s an awkward situation, and more importantly, it creates unnecessary work for the recruiters we’re trying to impress. In the worst-case scenario, repeated duplicate applications can lead to being flagged for spamming, or at worst being blacklisted/timed out.

While there are many complex job trackers on the market, DupCheck is built with a singular, lightweight focus: preventing duplicate applications by tracking the links you've already used.

If you are applying to a role that has been reposted or uploaded again with the same destination, DupCheck will catch it before you hit "submit." I hope that one day all job portals will have this duplicate detection built-in. But until then, DupCheck is here to help you protect your professional reputation and respect recruiters' time (who we are trying to impress :').

---

## Capabilities

- **Algorithmic Duplicate Prevention**: Tracks URLs locally and detects duplicates using Levenshtein distance and domain-level comparison.
- **Contextual Overlays**: Smart, non-intrusive toasts inject natively into complex SPAs (like LinkedIn or Workday) to render active historical match previews exactly when you need them.
- **Visual URL Diffing**: Instantly compare current URLs against your saved history with dynamic color-coding matching (`.char-match`) and non-matching characters (`.char-diff`).
- **Data Ownership**: Your data never leaves your machine(all data is stored locally in your browser). Export your complete categorized tracking database strictly to a local CSV when you need to.

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
