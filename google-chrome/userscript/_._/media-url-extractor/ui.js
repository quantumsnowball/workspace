// ui.js
let fab, popup, listContainer, badge, filterInput, shadowRoot;

// Key used for per-domain storage
const HEADERS_STORAGE_KEY = `media_extractor_headers_${location.hostname}`;
const TITLE_STORAGE_KEY = 'media_extractor_shared_title';

// Save top-level page title using static GM key when running in the main window
if (window.top === window) {
    try {
        if (typeof GM_setValue !== 'undefined') {
            GM_setValue(TITLE_STORAGE_KEY, document.title);
        } else {
            localStorage.setItem(TITLE_STORAGE_KEY, document.title);
        }
    } catch (e) {
        // fail gracefully if storage is restricted
    }
}

// Unified helper to retrieve page title (reads static GM key for iframe compatibility)
function getPopupDisplayTitle() {
    let title = '';

    // Read stored top-level title from static GM storage key
    try {
        if (typeof GM_getValue !== 'undefined') {
            title = GM_getValue(TITLE_STORAGE_KEY, '');
        } else {
            title = localStorage.getItem(TITLE_STORAGE_KEY) || '';
        }
    } catch (e) {
        title = '';
    }

    // Fall back to same-origin window.top or document.title
    if (!title) {
        try {
            if (window.top && window.top.document) {
                title = window.top.document.title;
            }
        } catch (e) {
            title = document.title;
        }
    }

    return title && title.trim() ? title.trim() : 'captured media urls';
}

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
            return GM_getValue(HEADERS_STORAGE_KEY, defaultHeaders);
        }
        const saved = localStorage.getItem(HEADERS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultHeaders;
    } catch (e) {
        return defaultHeaders;
    }
}

// Save settings per domain
function saveHeaders(headers) {
    try {
        if (typeof GM_setValue !== 'undefined') {
            GM_setValue(HEADERS_STORAGE_KEY, headers);
        } else {
            localStorage.setItem(HEADERS_STORAGE_KEY, JSON.stringify(headers));
        }
    } catch (e) {
        console.error('Failed to save header settings:', e);
    }
}

// Active headers initialized from persistent storage
const activeHeaders = loadSavedHeaders();

function attachHoverEffect(element, opacityHover = '1', opacityDefault = '0.85') {
    element.style.transition = 'opacity 0.15s ease, transform 0.1s ease';
    element.style.opacity = opacityDefault;
    element.onmouseover = (e) => {
        if (e.currentTarget === element) element.style.opacity = opacityHover;
    };
    element.onmouseout = (e) => {
        if (e.currentTarget === element) element.style.opacity = opacityDefault;
    };
}

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

    // set popup header title using unified title getter
    const titleElement = shadowRoot.getElementById('media-extractor-title');
    if (titleElement) {
        titleElement.textContent = getPopupDisplayTitle();
    }

    listContainer = shadowRoot.getElementById('media-extractor-list');
    badge = shadowRoot.getElementById('media-extractor-badge');
    filterInput = shadowRoot.getElementById('media-extractor-filter');
    const clearFilterBtn = shadowRoot.getElementById('media-extractor-clear-filter');
    const clearBtn = shadowRoot.getElementById('media-extractor-clear');
    const closeBtn = shadowRoot.getElementById('media-extractor-close');

    attachHoverEffect(clearBtn);
    attachHoverEffect(closeBtn);

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
            attachHoverEffect(btn, '1', '0.85');

            btn.onclick = () => {
                activeHeaders[headerName] = !activeHeaders[headerName];
                renderHeaderBtnState(btn, activeHeaders[headerName]);
                saveHeaders(activeHeaders);
            };
        }
    });

    // resolution quick filter presets
    const resGroupContainer = shadowRoot.getElementById('media-extractor-res-group');
    RES_PRESETS.forEach((preset) => {
        const btn = document.createElement('button');
        btn.textContent = preset.label;
        Object.assign(btn.style, RES_BTN_STYLE, { backgroundColor: preset.bg });
        attachHoverEffect(btn);

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

    clearFilterBtn.onmouseover = () => {
        Object.assign(clearFilterBtn.style, { color: '#fff', backgroundColor: '#dc3545', borderColor: '#dc3545' });
    };
    clearFilterBtn.onmouseout = () => {
        Object.assign(clearFilterBtn.style, { color: '#aaa', backgroundColor: '#3a3a3a', borderColor: '#555' });
    };

    fab.onclick = () => {
        popup.style.display = popup.style.display === 'none' ? 'flex' : 'none';
    };

    closeBtn.onclick = () => {
        popup.style.display = 'none';
    };

    clearBtn.onclick = onClear;

    filterInput.oninput = (e) => {
        onFilter(e.target.value.trim());
    };
}

function updateUiList(capturedUrls, filterKeyword) {
    if (!badge || !listContainer) return;

    const titleElement = shadowRoot.getElementById('media-extractor-title');
    if (titleElement) {
        titleElement.textContent = getPopupDisplayTitle();
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
        attachHoverEffect(copyUrlBtn);
        copyUrlBtn.onclick = (e) => {
            e.stopPropagation();
            copyToClipboard(url, copyUrlBtn, 'copied!', 'url');
        };

        const copyYtdlpBtn = document.createElement('button');
        copyYtdlpBtn.textContent = 'yt-dlp';
        Object.assign(copyYtdlpBtn.style, COPY_BTN_STYLE, { backgroundColor: '#17a2b8' });
        attachHoverEffect(copyYtdlpBtn);
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
