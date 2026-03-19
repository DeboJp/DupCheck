export function normalizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const paramsToStrip = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source', 'gclid', 'fbclid'];
    
    for (const param of paramsToStrip) {
      parsedUrl.searchParams.delete(param);
    }
    
    const sortedParams = new URLSearchParams();
    const keys = Array.from(parsedUrl.searchParams.keys()).sort();
    for (const key of keys) {
      sortedParams.append(key, parsedUrl.searchParams.get(key));
    }
    
    const searchString = sortedParams.toString() ? `?${sortedParams.toString()}` : '';
    return `${parsedUrl.origin}${parsedUrl.pathname}${searchString}`;
  } catch (e) {
    return url;
  }
}

export function getSimilarityPercentage(str1, str2) {
  if (str1 === str2) return 100;
  if (!str1 || !str2) return 0;
  
  const m = str1.length;
  const n = str2.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLength = Math.max(m, n);
  const distance = d[m][n];
  return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
}

export function isDomainMatch(url1, url2) {
  try {
    const d1 = new URL(url1).hostname;
    const d2 = new URL(url2).hostname;
    return d1 === d2 && d1 !== '';
  } catch (e) {
    return false;
  }
}

export function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

export function diffStringsColored(current, stored) {
    if (!current) return `<span>${stored}</span>`;
    const m = current.length;
    const n = stored.length;
    const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
    for (let i=1; i<=m; i++) {
        for (let j=1; j<=n; j++) {
            if (current[i-1] === stored[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }
    let i = m, j = n;
    const lcsIndices = new Set();
    while (i > 0 && j > 0) {
        if (current[i-1] === stored[j-1]) {
            lcsIndices.add(j-1);
            i--; j--;
        } else if (dp[i-1][j] > dp[i][j-1]) {
            i--;
        } else {
            j--;
        }
    }
    
    let html = '';
    let isMatchSegment = lcsIndices.has(0);
    let segment = stored[0] || '';
    
    for (let k = 1; k < n; k++) {
        const charMatch = lcsIndices.has(k);
        if (charMatch === isMatchSegment) {
            segment += stored[k];
        } else {
            html += `<span class="${isMatchSegment ? 'char-match' : 'char-diff'}">${segment}</span>`;
            isMatchSegment = charMatch;
            segment = stored[k];
        }
    }
    if (segment) {
        html += `<span class="${isMatchSegment ? 'char-match' : 'char-diff'}">${segment}</span>`;
    }
    return html;
}

export function exportToCSV(jobs) {
    if (!jobs || jobs.length === 0) return;
    const header = ['URL', 'Date', 'Time'];
    
    const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val);
        // If it contains a quote, escape it by doubling it.
        // Also always wrap the string in quotes to handle commas automatically.
        return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = jobs.map(j => {
        const d = new Date(j.timestamp);
        return [
            escapeCsv(j.url),
            escapeCsv(d.toLocaleDateString()),
            escapeCsv(d.toLocaleTimeString())
        ];
    });
    
    let csvContent = header.join(",") + "\n"
        + rows.map(row => row.join(",")).join("\n");
        
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute("download", "dupcheck_history.csv");
    
    // Append -> Click -> Remove to trigger download without disrupting actual page DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clear memory
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}
