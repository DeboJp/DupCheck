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
      matchesHtml = `<div class="jobtrack-matches-preview" style="font-size: 11px; max-height: 180px; overflow-y: auto; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <strong style="color: #4b5563; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Top Similar History:</strong>
        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">`;
      matches.forEach(m => {
          let badgeColor = m.sim === 100 ? '#fdf2f2' : (m.sim > 70 ? '#fef7ed' : '#f3f4f6');
          let textColor = m.sim === 100 ? '#d9534f' : (m.sim > 70 ? '#f0ad4e' : '#6b7280');
          
          let daysAgo = Math.floor((Date.now() - m.timestamp) / (1000 * 60 * 60 * 24));
          let daysText = daysAgo === 0 ? "Today" : (daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`);
          let dateText = new Date(m.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          let timeAgoStr = `${daysText} (${dateText})`;
          
          matchesHtml += `
            <div style="padding: 8px; background: #f9fafb; border-radius: 6px; border: 1px solid #f3f4f6;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; align-items: center;">
                <span style="font-weight: bold; color: ${textColor}; background: ${badgeColor}; padding: 2px 6px; border-radius: 4px; font-size: 9px;">${m.sim}% MATCH</span>
                <span style="font-size: 9px; color: #6b7280; font-weight: 500;">${timeAgoStr}</span>
              </div>
              <div style="word-wrap: break-word; line-height: 1.4; color: #1f2937;">
                <a href="${m.url}" target="_blank" style="color: inherit; text-decoration: none;" title="Open match in new tab">
                  ${m.coloredDiff}
                </a>
              </div>
            </div>
          `;
      });
      matchesHtml += `</div></div>`;
    }
    
    let headerText = isExactMatch ? '⚠️ Exact Match Found' : 'New Job Application?';
    let btnHtml = isExactMatch 
      ? `<button id="jobtrack-add-btn" disabled style="background:#ccc;cursor:not-allowed;">Already Tracked</button>` 
      : `<button id="jobtrack-add-btn">Track Job</button>`;

    container.innerHTML = `
      <div class="jobtrack-toast-header">
        <span class="jobtrack-logo">DupCheck</span>
        <button id="jobtrack-close-btn">&times;</button>
      </div>
      <div class="jobtrack-toast-body">
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
