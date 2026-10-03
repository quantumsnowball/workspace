// main.js
(function () {
    'use strict';

    const capturedUrls = new Set();
    let filterKeyword = '';

    function checkAndAddUrl(url) {
        if (!url || typeof url !== 'string') return;
        try {
            const absoluteUrl = new URL(url, window.location.href).href;
            const cleanUrl = absoluteUrl.split('?')[0].toLowerCase();
            if (cleanUrl.includes('.m3u8') || cleanUrl.includes('.mp4')) {
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
        document.querySelectorAll('video, source').forEach((el) => {
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
