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

function getNativeAcceptLanguage() {
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
        const langs = [];

        // 1. Traverse navigator.languages and append base fallback if missing
        navigator.languages.forEach((lang) => {
            if (!langs.includes(lang)) {
                langs.push(lang);
            }
            if (lang.includes('-')) {
                const baseLang = lang.split('-')[0];
                if (!langs.includes(baseLang)) {
                    langs.push(baseLang);
                }
            }
        });

        // 2. Filter out duplicates while preserving first-seen index order
        const uniqueLangs = Array.from(new Set(langs));

        // 3. Map decaying q-factors (1.0, 0.9, 0.8, 0.7...)
        return uniqueLangs
            .map((lang, idx) => {
                if (idx === 0) return lang;
                const q = Math.max(0.1, 1 - idx * 0.1).toFixed(1);
                return `${lang};q=${q}`;
            })
            .join(',');
    }

    return 'en-US';
}

// helper to sanitize page title for filename safety
function getSanitizedTitle() {
    const rawTitle = document.title.trim() || 'video';
    // sanitize reserved filesystem characters and double quotes
    return rawTitle.replace(/["/\\?%*:|"<>]/g, '_');
}

// helper to handle clipboard copying with brief button feedback
function copyToClipboard(text, button, successLabel, defaultLabel) {
    if (typeof GM_setClipboard !== 'undefined') {
        GM_setClipboard(text);
    } else {
        navigator.clipboard.writeText(text);
    }
    button.textContent = successLabel;
    setTimeout(() => {
        button.textContent = defaultLabel;
    }, 1200);
}
