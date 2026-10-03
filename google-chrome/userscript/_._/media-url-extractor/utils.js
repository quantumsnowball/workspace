// utils.js
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightSearchTerm(htmlStr, keyword) {
    if (!keyword) return htmlStr;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?![^<]*>)(${escapedKeyword})`, 'gi');
    return htmlStr.replace(regex, '<span style="color: #00ffff; background-color: #005f5f; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>');
}

function formatHighlightedUrl(rawUrl, keyword) {
    let formattedHtml = '';
    try {
        const parsed = new URL(rawUrl);
        const protocol = escapeHtml(parsed.protocol);
        const host = escapeHtml(parsed.host);
        let rest = escapeHtml(parsed.pathname + parsed.search + parsed.hash);

        const styledProtocol = `<span style="color: #7f7f7f;">${protocol}</span>`;
        const styledHost = `<span style="color: #ff8f00; font-weight: bold;">${host}</span>`;
        const redSlash = `<span style="color: #ff5555; font-weight: bold;">/</span>`;

        rest = rest.replace(/\//g, redSlash).replace(/(\.m3u8|\.mp4)/gi, '<span style="color: #f1fa8c; font-weight: bold;">$1</span>');
        formattedHtml = `${styledProtocol}${redSlash}${redSlash}${styledHost}${rest}`;
    } catch (e) {
        const escaped = escapeHtml(rawUrl);
        formattedHtml = escaped.replace(/\//g, '<span style="color: #ff5555; font-weight: bold;">/</span>').replace(/(\.m3u8|\.mp4)/gi, '<span style="color: #f1fa8c; font-weight: bold;">$1</span>');
    }
    return highlightSearchTerm(formattedHtml, keyword);
}
