// ui.js
let fab, popup, listContainer, badge, filterInput;

// tracks active headers to include in yt-dlp command
const activeHeaders = {
    Referer: false,
    Origin: false,
    'User-Agent': false,
    'Accept-Language': false,
};

function createUi(onClear, onFilter) {
    if (document.getElementById('media-extractor-fab')) return;

    // floating action button (centered at bottom)
    fab = document.createElement('div');
    fab.id = 'media-extractor-fab';
    fab.innerHTML = `🎥 <span id="media-extractor-badge" style="background:red;color:white;border-radius:10px;padding:2px 6px;font-size:11px;margin-left:4px;">0</span>`;
    Object.assign(fab.style, FAB_STYLE);

    // popup panel (centered horizontally above FAB)
    popup = document.createElement('div');
    popup.id = 'media-extractor-popup';
    Object.assign(popup.style, POPUP_STYLE);

    popup.innerHTML = `
        <div style="padding:10px 14px;background:#2d2d2d;border-bottom:1px solid #444;display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <b id="media-extractor-title" style="color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></b>
            <div style="flex-shrink:0;">
                <button id="media-extractor-clear" style="background:#dc3545;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;margin-right:6px;">clear</button>
                <button id="media-extractor-close" style="background:#6c757d;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;">✕</button>
            </div>
        </div>
        <div id="media-extractor-headers-bar" style="padding:8px 14px;background:#252525;border-bottom:1px solid #333;display:flex;align-items:center;gap:16px;user-select:none;line-height:1;">
            <span style="color:#aaa;font-size:11px;font-weight:bold;display:inline-flex;align-items:center;">headers:</span>
            <label style="color:#ddd;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" id="hdr-referer" style="cursor:pointer;margin:0;vertical-align:middle;" /> Referer</label>
            <label style="color:#ddd;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" id="hdr-origin" style="cursor:pointer;margin:0;vertical-align:middle;" /> Origin</label>
            <label style="color:#ddd;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" id="hdr-useragent" style="cursor:pointer;margin:0;vertical-align:middle;" /> User-Agent</label>
            <label style="color:#ddd;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" id="hdr-acceptlang" style="cursor:pointer;margin:0;vertical-align:middle;" /> Accept-Language</label>
        </div>
        <div id="media-extractor-list" style="padding:10px 14px;overflow-y:auto;max-height:380px;flex-grow:1;"></div>
        <div style="padding:10px 14px;background:#252525;border-top:1px solid #333;display:flex;align-items:center;gap:8px;">
            <div id="media-extractor-res-group" style="display:flex;gap:4px;flex-shrink:0;"></div>
            <input id="media-extractor-filter" type="text" placeholder="type keyword..." style="flex-grow:1;box-sizing:border-box;background:#181818;color:#fff;border:1px solid #444;border-radius:4px;padding:6px 10px;font-family:monospace;font-size:12px;outline:none;" />
            <button id="media-extractor-clear-filter" title="Clear filter text" style="background:#3a3a3a;color:#aaa;border:1px solid #555;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:11px;font-family:monospace;line-height:1;user-select:none;flex-shrink:0;">✕</button>
        </div>
    `;

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

    Object.entries(headerMap).forEach(([id, headerName]) => {
        const checkbox = document.getElementById(id);
        checkbox.onchange = (e) => {
            activeHeaders[headerName] = e.target.checked;
        };
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
        listContainer.innerHTML = '<div style="color:#aaa;text-align:center;padding:12px;">no media urls captured yet</div>';
        return;
    }

    if (filteredUrls.length === 0) {
        listContainer.innerHTML = '<div style="color:#aaa;text-align:center;padding:12px;">no matching urls found</div>';
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
