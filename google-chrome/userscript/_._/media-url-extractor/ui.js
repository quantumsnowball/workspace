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
    Object.assign(fab.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '999999',
        backgroundColor: '#222',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        fontSize: '14px',
        fontFamily: 'monospace',
        userSelect: 'none',
    });

    // popup panel (centered horizontally above FAB)
    popup = document.createElement('div');
    popup.id = 'media-extractor-popup';
    Object.assign(popup.style, {
        position: 'fixed',
        bottom: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100vw - 40px)',
        maxWidth: '1280px',
        maxHeight: '560px',
        backgroundColor: '#1e1e1e',
        color: '#fff',
        border: '1px solid #444',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        zIndex: '999999',
        display: 'none',
        flexDirection: 'column',
        fontFamily: 'monospace',
        fontSize: '12px',
        boxSizing: 'border-box',
    });

    // layout structure: header title -> checkboxes bar -> list container -> filter bar
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

    // header checkbox bindings
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

    // resolution quick filter preset buttons
    const resPresets = [
        { label: '480', bg: '#4a5568' },
        { label: '720', bg: '#2b6cb0' },
        { label: '1080', bg: '#2f855a' },
        { label: '1440', bg: '#d69e2e' },
        { label: '2560', bg: '#dd6b20' },
        { label: '2k', bg: '#e53e3e' },
        { label: '4k', bg: '#805ad5' },
    ];

    const resGroupContainer = document.getElementById('media-extractor-res-group');
    resPresets.forEach((preset) => {
        const btn = document.createElement('button');
        btn.textContent = preset.label;
        Object.assign(btn.style, {
            backgroundColor: preset.bg,
            color: '#fff',
            border: 'none',
            padding: '3px 7px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            opacity: '0.85',
            transition: 'opacity 0.15s ease, transform 0.1s ease',
            userSelect: 'none',
        });

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

    // clear filter text on button click
    clearFilterBtn.onclick = () => {
        filterInput.value = '';
        onFilter('');
        filterInput.focus();
    };

    clearFilterBtn.onmouseover = () => {
        clearFilterBtn.style.color = '#fff';
        clearFilterBtn.style.backgroundColor = '#dc3545';
        clearFilterBtn.style.borderColor = '#dc3545';
    };
    clearFilterBtn.onmouseout = () => {
        clearFilterBtn.style.color = '#aaa';
        clearFilterBtn.style.backgroundColor = '#3a3a3a';
        clearFilterBtn.style.borderColor = '#555';
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
        Object.assign(row.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            padding: '8px 12px',
            backgroundColor: '#2b2b2b',
            borderRadius: '4px',
            wordBreak: 'break-all',
            gap: '12px',
        });

        // url text preview
        const urlText = document.createElement('span');
        urlText.innerHTML = formatHighlightedUrl(url, filterKeyword);
        urlText.style.flexGrow = '1';
        urlText.style.maxHeight = '60px';
        urlText.style.overflow = 'hidden';

        // action buttons container
        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, {
            display: 'flex',
            gap: '6px',
            flexShrink: '0',
        });

        // copy raw url button
        const copyUrlBtn = document.createElement('button');
        copyUrlBtn.textContent = 'url';
        Object.assign(copyUrlBtn.style, {
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'monospace',
        });
        copyUrlBtn.onclick = () => copyToClipboard(url, copyUrlBtn, 'copied!', 'url');

        // copy yt-dlp command button
        const copyYtdlpBtn = document.createElement('button');
        copyYtdlpBtn.textContent = 'yt-dlp';
        Object.assign(copyYtdlpBtn.style, {
            backgroundColor: '#17a2b8',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'monospace',
        });
        copyYtdlpBtn.onclick = () => copyToClipboard(buildYtdlpCommand(activeHeaders, url), copyYtdlpBtn, 'copied!', 'yt-dlp');

        btnContainer.appendChild(copyUrlBtn);
        btnContainer.appendChild(copyYtdlpBtn);

        row.appendChild(urlText);
        row.appendChild(btnContainer);
        listContainer.appendChild(row);
    });
}
