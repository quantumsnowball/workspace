// ui.js
let fab, popup, listContainer, badge, filterInput;

function createUi(onClear, onFilter) {
    if (document.getElementById('media-extractor-fab')) return;

    // floating action button
    fab = document.createElement('div');
    fab.id = 'media-extractor-fab';
    fab.innerHTML = `🎥 <span id="media-extractor-badge" style="background:red;color:white;border-radius:10px;padding:2px 6px;font-size:11px;margin-left:4px;">0</span>`;
    Object.assign(fab.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '999999',
        backgroundColor: '#222',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        fontSize: '14px',
        fontFamily: 'monospace',
        userSelect: 'none',
    });

    // popup panel
    popup = document.createElement('div');
    popup.id = 'media-extractor-popup';
    Object.assign(popup.style, {
        position: 'fixed',
        bottom: '70px',
        right: '20px',
        width: 'calc(100vw - 40px)', // takes container width with 20px padding on each side
        maxWidth: '1280px', // capped at half of 2560px screen width
        maxHeight: '520px',
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

    popup.innerHTML = `
        <div style="padding:10px 14px;background:#2d2d2d;border-bottom:1px solid #444;display:flex;justify-content:space-between;align-items:center;">
            <b style="color:#fff;">captured media urls</b>
            <div>
                <button id="media-extractor-clear" style="background:#dc3545;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;margin-right:6px;">clear</button>
                <button id="media-extractor-close" style="background:#6c757d;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;">✕</button>
            </div>
        </div>
        <div id="media-extractor-list" style="padding:10px 14px;overflow-y:auto;max-height:380px;flex-grow:1;"></div>
        <div style="padding:10px 14px;background:#252525;border-top:1px solid #333;display:flex;align-items:center;gap:10px;">
            <label for="media-extractor-filter" style="color:#aaa;font-size:11px;white-space:nowrap;user-select:none;">filter:</label>
            <input id="media-extractor-filter" type="text" placeholder="type keyword..." style="width:100%;box-sizing:border-box;background:#181818;color:#fff;border:1px solid #444;border-radius:4px;padding:6px 10px;font-family:monospace;font-size:12px;outline:none;" />
        </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(popup);

    listContainer = document.getElementById('media-extractor-list');
    badge = document.getElementById('media-extractor-badge');
    filterInput = document.getElementById('media-extractor-filter');

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

        const urlText = document.createElement('span');
        urlText.innerHTML = formatHighlightedUrl(url, filterKeyword);
        urlText.style.flexGrow = '1';
        urlText.style.maxHeight = '60px';
        urlText.style.overflow = 'hidden';

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'copy';
        Object.assign(copyBtn.style, {
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '5px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            flexShrink: '0',
        });

        copyBtn.onclick = () => {
            if (typeof GM_setClipboard !== 'undefined') {
                GM_setClipboard(url);
            } else {
                navigator.clipboard.writeText(url);
            }
            copyBtn.textContent = 'copied!';
            setTimeout(() => {
                copyBtn.textContent = 'copy';
            }, 1500);
        };

        row.appendChild(urlText);
        row.appendChild(copyBtn);
        listContainer.appendChild(row);
    });
}
