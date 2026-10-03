// ui.js
let fab, popup, listContainer, badge, filterInput;

// Key used for per-domain storage
const STORAGE_KEY = `media_extractor_headers_${location.hostname}`;

// Default header states
const defaultHeaders = {
    Referer: false,
    Origin: false,
    'User-Agent': false,
    'Accept-Language': false,
};

// Load saved settings per domain
function loadSavedHeaders() {
    try {
        if (typeof GM_getValue !== 'undefined') {
            return GM_getValue(STORAGE_KEY, defaultHeaders);
        }
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultHeaders;
    } catch (e) {
        return defaultHeaders;
    }
}

// Save settings per domain
function saveHeaders(headers) {
    try {
        if (typeof GM_setValue !== 'undefined') {
            GM_setValue(STORAGE_KEY, headers);
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(headers));
        }
    } catch (e) {
        console.error('Failed to save header settings:', e);
    }
}

// Active headers initialized from persistent storage
const activeHeaders = loadSavedHeaders();

function createUi(onClear, onFilter) {
    if (document.getElementById('media-extractor-fab')) return;

    // floating action button
    fab = document.createElement('div');
    fab.id = 'media-extractor-fab';
    fab.innerHTML = FAB_HTML;
    Object.assign(fab.style, FAB_STYLE);

    // popup panel
    popup = document.createElement('div');
    popup.id = 'media-extractor-popup';
    Object.assign(popup.style, POPUP_STYLE);
    popup.innerHTML = POPUP_LAYOUT_HTML;

    document.body.appendChild(fab);
    document.body.appendChild(popup);

    document.getElementById('media-extractor-title').textContent = document.title.trim() || 'captured media urls';

    listContainer = document.getElementById('media-extractor-list');
    badge = document.getElementById('media-extractor-badge');
    filterInput = document.getElementById('media-extractor-filter');
    const clearFilterBtn = document.getElementById('media-extractor-clear-filter');

    const headerMap = {
        'hdr-referer': 'Referer',
        'hdr-origin': 'Origin',
        'hdr-useragent': 'User-Agent',
        'hdr-acceptlang': 'Accept-Language',
    };

    // Restore saved checkbox states & set change listeners
    Object.entries(headerMap).forEach(([id, headerName]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = !!activeHeaders[headerName];
            checkbox.onchange = (e) => {
                activeHeaders[headerName] = e.target.checked;
                saveHeaders(activeHeaders);
            };
        }
    });

    const resGroupContainer = document.getElementById('media-extractor-res-group');
    RES_PRESETS.forEach((preset) => {
        const btn = document.createElement('button');
        btn.textContent = preset.label;
        Object.assign(btn.style, RES_BTN_STYLE, { backgroundColor: preset.bg });

        btn.onmouseover = () => {
            btn.style.opacity = '1';
        };
        btn.onmouseout = () => {
            btn.style.opacity = '0.85';
        };
        btn.onclick = () => {
            filterInput.value = preset.label;
            onFilter(preset.label);
        };

        resGroupContainer.appendChild(btn);
    });

    clearFilterBtn.onclick = () => {
        filterInput.value = '';
        onFilter('');
        filterInput.focus();
    };

    clearFilterBtn.onmouseover = () => {
        Object.assign(clearFilterBtn.style, { color: '#fff', backgroundColor: '#dc3545', borderColor: '#dc3545' });
    };
    clearFilterBtn.onmouseout = () => {
        Object.assign(clearFilterBtn.style, { color: '#aaa', backgroundColor: '#3a3a3a', borderColor: '#555' });
    };

    fab.onclick = () => {
        popup.style.display = popup.style.display === 'none' ? 'flex' : 'none';
    };

    document.getElementById('media-extractor-close').onclick = () => {
        popup.style.display = 'none';
    };

    document.getElementById('media-extractor-clear').onclick = onClear;

    filterInput.oninput = (e) => {
        onFilter(e.target.value.trim());
    };
}

function updateUiList(capturedUrls, filterKeyword) {
    if (!badge || !listContainer) return;

    const titleElement = document.getElementById('media-extractor-title');
    if (titleElement) {
        titleElement.textContent = document.title.trim() || 'captured media urls';
    }

    const lowerKeyword = filterKeyword.toLowerCase();
    const filteredUrls = Array.from(capturedUrls).filter((url) => url.toLowerCase().includes(lowerKeyword));

    badge.textContent = capturedUrls.size;
    listContainer.innerHTML = '';

    if (capturedUrls.size === 0) {
        listContainer.innerHTML = EMPTY_LIST_HTML;
        return;
    }

    if (filteredUrls.length === 0) {
        listContainer.innerHTML = NO_MATCH_LIST_HTML;
        return;
    }

    filteredUrls.forEach((url) => {
        const row = document.createElement('div');
        Object.assign(row.style, LIST_ROW_STYLE);

        const urlText = document.createElement('span');
        urlText.innerHTML = formatHighlightedUrl(url, filterKeyword);
        Object.assign(urlText.style, { flexGrow: '1', maxHeight: '60px', overflow: 'hidden' });

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, { display: 'flex', gap: '6px', flexShrink: '0' });

        const copyUrlBtn = document.createElement('button');
        copyUrlBtn.textContent = 'url';
        Object.assign(copyUrlBtn.style, COPY_BTN_STYLE, { backgroundColor: '#28a745' });
        copyUrlBtn.onclick = () => copyToClipboard(url, copyUrlBtn, 'copied!', 'url');

        const copyYtdlpBtn = document.createElement('button');
        copyYtdlpBtn.textContent = 'yt-dlp';
        Object.assign(copyYtdlpBtn.style, COPY_BTN_STYLE, { backgroundColor: '#17a2b8' });
        copyYtdlpBtn.onclick = () => copyToClipboard(buildYtdlpCommand(activeHeaders, url), copyYtdlpBtn, 'copied!', 'yt-dlp');

        btnContainer.appendChild(copyUrlBtn);
        btnContainer.appendChild(copyYtdlpBtn);

        row.appendChild(urlText);
        row.appendChild(btnContainer);
        listContainer.appendChild(row);
    });
}
