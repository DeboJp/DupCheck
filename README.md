# DupCheck

**DupCheck** is a single-purpose Chrome extension engineered to track your job application history flawlessly and protect you from unknowingly applying to the exact same job twice. It actively tracks, categorizes, and alerts you using visual diffs and URL similarity logic directly in your browser.

## Features

- **Duplicate Prevention:** Tracks URLs in local storage and intelligently detects duplicates using Levenshtein distance grouping and domain comparison.
- **Auto-Injection Overlays (Toasts):** Smart auto-popups inject natively in your webpage on all web pages, rendering live match previews and supporting native SPAs like LinkedIn.
- **Visual URL Diffing:** Compare the current URL string with your historically saved URLs, dynamically color-coding matching (`.char-match`) and non-matching characters (`.char-diff`) for unparalleled transparency.
- **Export to CSV:** Own your own data. Easily export your total categorized database log straight to CSV locally with a single click.

## Installation / Loading in Chrome Developer Mode

1. Open a new tab in Google Chrome and type `chrome://extensions/`.
2. Ensure the **Developer mode** toggle in the top right corner is turned **ON**.
3. Click the **Load unpacked** button.
4. Select the `DupCheck` extension folder (`/Users/debojyotipaul/Documents/JOB Chrome Extension/`).
5. **Pin** the extension to your toolbar to get live badge count numbers on your applied jobs for the day and easily check matches!

## Web Store Information

- **Name**: DupCheck
- **Short Description**: Track duplicate job applications and safeguard against applying twice.
- **Categories**: Productivity, Workflow
- **Permissions Justification**:
  - `storage`: Essential for confidentially storing the job history URLs directly within your browser.
  - `tabs` & `activeTab`: Necessary for detecting and inspecting your current URL to map against the local history.
  - `scripting`: Key injection technique for securely rendering the "Add to DB" overlay on single page applications.
  - `<all_urls>`: The tracker needs flexibility across random domains since job portals are deeply varied. 

---
*No remote servers are used. All your history lives strictly locally in `chrome.storage.local` inside your browser environment.*
