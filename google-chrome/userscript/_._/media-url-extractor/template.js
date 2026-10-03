// template.js
const FAB_HTML = `🎥<span id="media-extractor-badge" style="background:#e63946;color:#fff;border-radius:10px;padding:2px 7px;font-size:11px;font-weight:bold;margin-left:6px;box-shadow:0 2px 4px rgba(0,0,0,0.4);">0</span>`;

const POPUP_LAYOUT_HTML = `
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

const EMPTY_LIST_HTML = '<div style="color:#aaa;text-align:center;padding:12px;">no media urls captured yet</div>';
const NO_MATCH_LIST_HTML = '<div style="color:#aaa;text-align:center;padding:12px;">no matching urls found</div>';
