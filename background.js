import { normalizeUrl, getTodayDateString, getSimilarityPercentage, isDomainMatch, diffStringsColored } from './utils.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['appliedJobs', 'isEnabled'], (result) => {
    if (chrome.runtime.lastError || !result) return;
    if (!result.appliedJobs) {
      chrome.storage.local.set({ appliedJobs: [] });
    }
    if (result.isEnabled === undefined) {
      chrome.storage.local.set({ isEnabled: true });
    }
  });
});

async function getStorageData(key, def) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError || !result) {
        resolve(def);
      } else {
        resolve(result[key] !== undefined ? result[key] : def);
      }
    });
  });
}

function updateBadge() {
  chrome.storage.local.get(['appliedJobs', 'isEnabled'], (result) => {
    if (chrome.runtime.lastError || !result) return;
    if (!result.isEnabled) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }
    const jobs = result.appliedJobs || [];
    const today = getTodayDateString();
    const dailyCount = jobs.filter(j => j.dateString === today).length;
    chrome.action.setBadgeText({ text: dailyCount > 0 ? dailyCount.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
  });
}

updateBadge();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.appliedJobs || changes.isEnabled)) {
    updateBadge();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const isValidUrl = tab.url && tab.url.startsWith('http') && 
                     !tab.url.startsWith('https://chrome.google.com/webstore') &&
                     !tab.url.startsWith('https://chromewebstore.google.com');

  if ((changeInfo.status === 'complete' || changeInfo.url) && isValidUrl) {
    const isEnabled = await getStorageData('isEnabled', true);
    if (!isEnabled) return;
    
    const jobs = await getStorageData('appliedJobs', []);
    const currentNorm = normalizeUrl(tab.url);
    
    const scoredJobs = jobs.map(j => {
      const jNorm = normalizeUrl(j.url);
      const sim = getSimilarityPercentage(currentNorm, jNorm);
      const domainMatch = isDomainMatch(tab.url, j.url);
      const coloredDiff = diffStringsColored(currentNorm, jNorm);
      return { ...j, sim, domainMatch, coloredDiff };
    });
    
    const matches = scoredJobs.filter(j => j.sim > 0 || j.domainMatch)
                              .sort((a, b) => b.sim - a.sim)
                              .slice(0, 3);
                              
    const isExactMatch = jobs.some(j => normalizeUrl(j.url) === currentNorm);
    
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      
      const today = getTodayDateString();
      const dailyCount = jobs.filter(j => j.dateString === today).length;
      
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
          action: 'show_toast',
          url: tab.url,
          dailyCount: dailyCount,
          isExactMatch: isExactMatch,
          matches: matches
        }).catch(e => { /* ignores inactive listeners */ });
      }, 100);

    } catch (e) {
      console.warn("Add DupliJobs Injection Context Error: ", e);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'add_to_db') {
    chrome.storage.local.get(['appliedJobs'], (result) => {
      if (chrome.runtime.lastError || !result) {
        sendResponse({ success: false, reason: 'Storage error' });
        return;
      }
      const jobs = result.appliedJobs || [];
      const newJob = {
        url: request.url,
        timestamp: Date.now(),
        dateString: getTodayDateString()
      };
      
      const currentNorm = normalizeUrl(request.url);
      if (!jobs.some(j => normalizeUrl(j.url) === currentNorm)) {
        jobs.push(newJob);
        chrome.storage.local.set({ appliedJobs: jobs }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, reason: 'Already exists' });
      }
    });
    return true; 
  }
});
