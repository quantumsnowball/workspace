// ui.js
let fab, popup, listContainer, badge, filterInput, shadowRoot;

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
    if (document.getElementById('media-extractor-host')) return;

    // create a host container for the Shadow DOM
    const host = document.createElement('div');
    host.id = 'media-extractor-host';
    document.body.appendChild(host);

    // attach an open Shadow Root
    shadowRoot = host.attachShadow({ mode: 'open' });

    // FAB
    fab = document.createElement('div');
    fab.id = 'media-extractor-fab';
    fab.innerHTML = FAB_HTML;
    Object.assign(fab.style, FAB_STYLE);
    fab.onmouseover = () => Object.assign(fab.style, FAB_HOVER_STYLE);
    fab.onmouseout = () => Object.assign(fab.style, FAB_STYLE);

    // popup
    popup = document.createElement('div');
    popup.id = 'media-extractor-popup';
    Object.assign(popup.style, POPUP_STYLE);
    popup.innerHTML = POPUP_LAYOUT_HTML;

    // attach elements inside the shadow tree
    shadowRoot.appendChild(fab);
    shadowRoot.appendChild(popup);

    // query elements from shadowRoot instead of document
    const titleElement = shadowRoot.getElementById('media-extractor-title');
    if (titleElement) {
        titleElement.textContent = document.title.trim() || 'captured media urls';
    }

    listContainer = shadowRoot.getElementById('media-extractor-list');
    badge = shadowRoot.getElementById('media-extractor-badge');
    filterInput = shadowRoot.getElementById('media-extractor-filter');
    const clearFilterBtn = shadowRoot.getElementById('media-extractor-clear-filter');

    // header toggle button bindings
    function renderHeaderBtnState(btn, isActive) {
        Object.assign(btn.style, HEADER_TOGGLE_BTN_BASE, isActive ? HEADER_TOGGLE_BTN_ON : HEADER_TOGGLE_BTN_OFF);
    }

    const headerMap = {
        'hdr-referer': 'Referer',
        'hdr-origin': 'Origin',
        'hdr-useragent': 'User-Agent',
        'hdr-acceptlang': 'Accept-Language',
    };

    Object.entries(headerMap).forEach(([id, headerName]) => {
        const btn = shadowRoot.getElementById(id);
        if (btn) {
            renderHeaderBtnState(btn, !!activeHeaders[headerName]);
            btn.onclick = () => {
                activeHeaders[headerName] = !activeHeaders[headerName];
                renderHeaderBtnState(btn, activeHeaders[headerName]);
                saveHeaders(activeHeaders);
            };
        }
    });

    // Resolution quick filter presets
    const resGroupContainer = shadowRoot.getElementById('media-extractor-res-group');
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

    // Filter clear & search handlers
    clearFilterBtn.onclick = () => {
        filterInput.value = '';
        onFilter('');
        filterInput.focus();
    };

    fab.onclick = () => {
        popup.style.display = popup.style.display === 'none' ? 'flex' : 'none';
    };

    shadowRoot.getElementById('media-extractor-close').onclick = () => {
        popup.style.display = 'none';
    };

    shadowRoot.getElementById('media-extractor-clear').onclick = onClear;

    filterInput.oninput = (e) => {
        onFilter(e.target.value.trim());
    };
}

function updateUiList(capturedUrls, filterKeyword) {
    if (!badge || !listContainer) return;

    const titleElement = shadowRoot.getElementById('media-extractor-title');
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
        Object.assign(row.style, LIST_ROW_STYLE, {
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
        });

        row.onmouseover = () => {
            row.style.backgroundColor = '#383838';
        };
        row.onmouseout = () => {
            row.style.backgroundColor = '#2b2b2b';
        };

        const urlText = document.createElement('span');
        urlText.innerHTML = formatHighlightedUrl(url, filterKeyword);
        Object.assign(urlText.style, { flexGrow: '1', maxHeight: '60px', overflow: 'hidden' });

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, { display: 'flex', gap: '6px', flexShrink: '0' });

        const copyUrlBtn = document.createElement('button');
        copyUrlBtn.textContent = 'url';
        Object.assign(copyUrlBtn.style, COPY_BTN_STYLE, { backgroundColor: '#28a745' });
        copyUrlBtn.onclick = (e) => {
            e.stopPropagation();
            copyToClipboard(url, copyUrlBtn, 'copied!', 'url');
        };

        const copyYtdlpBtn = document.createElement('button');
        copyYtdlpBtn.textContent = 'yt-dlp';
        Object.assign(copyYtdlpBtn.style, COPY_BTN_STYLE, { backgroundColor: '#17a2b8' });
        copyYtdlpBtn.onclick = (e) => {
            e.stopPropagation();
            copyToClipboard(buildYtdlpCommand(activeHeaders, url), copyYtdlpBtn, 'copied!', 'yt-dlp');
        };

        row.onclick = () => {
            copyToClipboard(buildYtdlpCommand(activeHeaders, url), copyYtdlpBtn, 'copied!', 'yt-dlp');
        };

        btnContainer.appendChild(copyUrlBtn);
        btnContainer.appendChild(copyYtdlpBtn);

        row.appendChild(urlText);
        row.appendChild(btnContainer);
        listContainer.appendChild(row);
    });
}
