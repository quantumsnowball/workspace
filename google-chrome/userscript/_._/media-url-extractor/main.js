// main.js
(function () {
    'use strict';

    const capturedUrls = new Set();
    let filterKeyword = '';

    // common media extensions to capture
    const MEDIA_REGEX = /\.(m3u8|mp4|m4s|m4v|webm|mpd|mov|flv|avi|mkv|mp3|m4a|aac|ogg|wav|flac)(\?|$)/i;

    function checkAndAddUrl(url) {
        if (!url || typeof url !== 'string') return;
        try {
            const absoluteUrl = new URL(url, window.location.href).href;
            if (MEDIA_REGEX.test(absoluteUrl)) {
                if (!capturedUrls.has(absoluteUrl)) {
                    capturedUrls.add(absoluteUrl);
                    updateUiList(capturedUrls, filterKeyword);
                }
            }
        } catch (e) {
            // ignore invalid urls
        }
    }

    function scanMediaElements() {
        document.querySelectorAll('video, audio, source').forEach((el) => {
            if (el.src) checkAndAddUrl(el.src);
        });
    }

    // initialize network hooks from interceptor.js
    initInterceptors(checkAndAddUrl);

    // initialize DOM UI once ready
    window.addEventListener('DOMContentLoaded', () => {
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
        scanMediaElements();
        new MutationObserver(scanMediaElements).observe(document.body, { childList: true, subtree: true });
    });
})();
