// main.js
(function () {
    'use strict';

    const capturedUrls = new Set();
    let filterKeyword = '';

    // common media extensions to capture
    const MEDIA_REGEX = /\.(m3u8|mp4|m4s|m4v|webm|mpd|mov|flv|avi|mkv|mp3|m4a|aac|ogg|wav|flac)(\?|$)/i;

    const isTopWindow = window.top === window;

    function checkAndAddUrl(url) {
        if (!url || typeof url !== 'string') return;
        try {
            const absoluteUrl = new URL(url, window.location.href).href;
            if (MEDIA_REGEX.test(absoluteUrl)) {
                if (!capturedUrls.has(absoluteUrl)) {
                    capturedUrls.add(absoluteUrl);

                    // Only update UI if running in top frame
                    if (isTopWindow && typeof updateUiList === 'function') {
                        updateUiList(capturedUrls, filterKeyword);
                    }
                }
            }
        } catch (e) {
            // ignore invalid urls
        }
    }

    function scanMediaElements() {
        document.querySelectorAll('video, audio, source').forEach((el) => {
            if (el.src) checkAndAddUrl(el.src);
            if (el.currentSrc) checkAndAddUrl(el.currentSrc);
        });
    }

    // initialize network hooks from interceptor.js (runs in both top window & child iframes)
    if (typeof initInterceptors === 'function') {
        initInterceptors(checkAndAddUrl);
    }

    // DOM ready initialization
    window.addEventListener('DOMContentLoaded', () => {
        // 1. Render UI ONLY if running in the top-level main window
        if (isTopWindow && typeof createUi === 'function') {
            createUi(
                () => {
                    capturedUrls.clear();
                    updateUiList(capturedUrls, filterKeyword);
                },
                (keyword) => {
                    filterKeyword = keyword;
                    updateUiList(capturedUrls, filterKeyword);
                },
            );
        }

        // 2. Perform element scans and observe DOM changes across all frames
        scanMediaElements();
        if (document.body) {
            new MutationObserver(scanMediaElements).observe(document.body, { childList: true, subtree: true });
        }
    });
})();
