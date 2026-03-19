import { normalizeUrl, getSimilarityPercentage, isDomainMatch, getTodayDateString, diffStringsColored, exportToCSV } from '../utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const totalCountEl = document.getElementById('totalCount');
  const dailyCountEl = document.getElementById('dailyCount');
  const dailyHighCountEl = document.getElementById('dailyHighCount');
  const jobListEl = document.getElementById('jobList');
  const matchesSection = document.getElementById('matchesSection');
  const matchesList = document.getElementById('matchesList');
  const statusBanner = document.getElementById('statusBanner');
  const statusIcon = document.getElementById('statusIcon');
  const statusMsg = document.getElementById('statusMsg');

  chrome.storage.local.get(['appliedJobs', 'isEnabled'], async (result) => {
    const isEnabled = result.isEnabled !== false; 
    toggleSwitch.checked = isEnabled;
    
    toggleSwitch.addEventListener('change', (e) => {
      chrome.storage.local.set({ isEnabled: e.target.checked });
      if (!e.target.checked) {
        setStatusBanner('grey', 'Extension is currently paused.');
      } else {
        location.reload(); 
      }
    });

    const jobs = result.appliedJobs || [];
    
    exportCsvBtn.addEventListener('click', () => {
        exportToCSV(jobs);
    });

    totalCountEl.textContent = jobs.length;
    const today = getTodayDateString();
    dailyCountEl.textContent = jobs.filter(j => j.dateString === today).length;

    const dateCounts = {};
    jobs.forEach(j => {
      dateCounts[j.dateString] = (dateCounts[j.dateString] || 0) + 1;
    });
    const maxDaily = jobs.length > 0 ? Math.max(...Object.values(dateCounts)) : 0;
    dailyHighCountEl.textContent = maxDaily;

    if (!isEnabled) {
       setStatusBanner('grey', 'Extension is paused.');
       jobListEl.innerHTML = '<div class="empty-state">Toggle to resume tracking.</div>';
       return;
    }

    // Render All Jobs based strictly on date (descending)
    renderList(jobs.slice().sort((a,b) => b.timestamp - a.timestamp), jobListEl, null);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;
      const currentTabUrl = tabs[0].url || '';
      
      if (currentTabUrl.startsWith('chrome://')) {
        setStatusBanner('grey', 'Not a trackable web page.');
        return;
      }

      const currentNorm = normalizeUrl(currentTabUrl);

      const scoredJobs = jobs.map(j => {
        const jNorm = normalizeUrl(j.url);
        const sim = getSimilarityPercentage(currentNorm, jNorm);
        const domainMatch = isDomainMatch(currentTabUrl, j.url);
        
        let type = 'none';
        if (sim === 100) type = 'exact';
        else if (sim > 70) type = 'high';
        else if (domainMatch) type = 'domain';

        return { ...j, sim, type, domainMatch, coloredDiff: diffStringsColored(currentNorm, jNorm) };
      });

      // Filter matches to those that have at least some similarity or domain match
      const matches = scoredJobs.filter(j => j.sim > 30 || j.domainMatch).sort((a, b) => b.sim - a.sim);

      if (matches.length > 0) {
        matchesSection.style.display = 'block';
        renderList(matches, matchesList, currentNorm);
        
        const best = matches[0];
        if (best.type === 'exact') {
           setStatusBanner('red');
        } else if (best.type === 'high') {
           setStatusBanner('orange');
        } else if (best.type === 'domain') {
           setStatusBanner('yellow');
        } else {
           setStatusBanner('green');
        }
      } else {
        setStatusBanner('green');
      }
    });
  });

  function renderList(list, containerEl, highlightAgainstNorm = null) {
    if (list.length === 0) {
      containerEl.innerHTML = '<div class="empty-state">No matching history found.</div>';
      return;
    }
    containerEl.innerHTML = '';
    list.forEach(j => {
      let badgeClass = 'badge-grey';
      let badgeText = j.type ? (j.sim + '% Match') : 'History';

      if (j.type === 'exact') { badgeClass = 'badge-red'; badgeText = '100% Exact'; }
      else if (j.type === 'high') { badgeClass = 'badge-orange'; }
      else if (j.type === 'domain') { badgeClass = 'badge-yellow'; badgeText = 'Domain'; }

      const urlHTML = highlightAgainstNorm ? j.coloredDiff : j.url;

      const item = document.createElement('li');
      item.className = 'job-item';
      item.innerHTML = `
        <div class="job-meta">
          <span class="job-date">${new Date(j.timestamp).toLocaleString()}</span>
          <span class="job-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="job-url" title="Open Link">${urlHTML}</div>
      `;
      item.addEventListener('click', () => {
         chrome.tabs.create({ url: j.url });
      });
      containerEl.appendChild(item);
    });
  }

  function setStatusBanner(colorClass, msgOverride = null) {
    statusBanner.className = 'status-banner ' + colorClass;
    if (colorClass === 'red') {
      statusIcon.textContent = '⛔';
      statusMsg.textContent = msgOverride || 'Exact match found in DB!';
    } else if (colorClass === 'orange') {
      statusIcon.textContent = '⚠️';
      statusMsg.textContent = msgOverride || 'High similarity (possible duplicate).';
    } else if (colorClass === 'yellow') {
      statusIcon.textContent = '🏢';
      statusMsg.textContent = msgOverride || 'Company domain matched.';
    } else if (colorClass === 'green') {
      statusIcon.textContent = '✅';
      statusMsg.textContent = msgOverride || 'No match found (Safe to apply).';
    } else if (colorClass === 'grey') {
      statusIcon.textContent = 'ℹ️';
      statusMsg.textContent = msgOverride || 'Inactive';
    }
  }
});
