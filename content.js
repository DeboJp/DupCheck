if (!window.jobTrackContentScriptLoaded) {
  window.jobTrackContentScriptLoaded = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'show_toast') {
      showToast(request.url, request.dailyCount, request.isExactMatch, request.matches);
      sendResponse({ received: true });
    } else if (request.action === 'hide_toast') {
      const existing = document.getElementById('jobtrack-toast-container');
      if (existing) existing.remove();
      sendResponse({ received: true });
    }
  });

  function showToast(url, dailyCount, isExactMatch, matches) {
    const existing = document.getElementById('jobtrack-toast-container');
    if (existing) {
      existing.remove();
    }

    const container = document.createElement('div');
    container.id = 'jobtrack-toast-container';
    
    let matchesHtml = '';
    if (matches && matches.length > 0) {
      matchesHtml = `<div class="jobtrack-matches-preview">
        <strong class="jobtrack-preview-title">Top Similar History:</strong>
        <ul class="jobtrack-matches-list">`;
      matches.forEach(m => {
          let badgeClass = m.sim === 100 ? 'jobtrack-badge-exact' : (m.sim > 70 ? 'jobtrack-badge-high' : 'jobtrack-badge-low');
          
          let daysAgo = Math.floor((Date.now() - m.timestamp) / (1000 * 60 * 60 * 24));
          let daysText = daysAgo === 0 ? "Today" : (daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`);
          let dateText = new Date(m.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          let timeAgoStr = `${daysText} (${dateText})`;
          
          matchesHtml += `
            <li class="jobtrack-preview-item">
              <div class="jobtrack-preview-meta">
                <span class="jobtrack-preview-badge ${badgeClass}">${m.sim}% MATCH</span>
                <span class="jobtrack-preview-time">${timeAgoStr}</span>
              </div>
              <a href="${m.url}" target="_blank" class="jobtrack-preview-link" title="Open match in new tab">
                ${m.coloredDiff}
              </a>
            </li>
          `;
      });
      matchesHtml += `</ul></div>`;
    }
    
    let headerText = isExactMatch ? '⚠️ Exact Match Found' : 'New Job Application?';
    let btnHtml = isExactMatch 
      ? `<button id="jobtrack-add-btn" disabled>Already Tracked</button>` 
      : `<button id="jobtrack-add-btn">Track Job</button>`;

    container.innerHTML = `
      <div class="jobtrack-toast-header">
        <span class="jobtrack-logo">DupCheck</span>
        <button id="jobtrack-close-btn" aria-label="Dismiss Alert">&times;</button>
      </div>
      <div class="jobtrack-toast-body" aria-live="polite">
        <p>${headerText}</p>
        <span class="jobtrack-daily-count">Today: ${dailyCount}</span>
      </div>
      ${matchesHtml}
      ${btnHtml}
    `;

    document.body.appendChild(container);

    document.getElementById('jobtrack-close-btn').addEventListener('click', () => {
      container.remove();
    });

    const addBtn = document.getElementById('jobtrack-add-btn');
    if (!isExactMatch) {
      addBtn.addEventListener('click', () => {
        addBtn.textContent = 'Tracking...';
        addBtn.disabled = true;

        chrome.runtime.sendMessage({ action: 'add_to_db', url: url }, (response) => {
          if (response && response.success) {
            addBtn.textContent = 'Tracked!';
            addBtn.style.backgroundColor = '#5cb85c';
            setTimeout(() => {
              if (container.parentNode) container.remove();
            }, 1500);
          } else {
            addBtn.textContent = 'Error/Exists';
            setTimeout(() => {
               addBtn.disabled = false;
               addBtn.textContent = 'Track Job';
            }, 2000);
          }
        });
      });
    }
  }
}
