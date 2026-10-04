// main.js
(function () {
    'use strict';

    const capturedUrls = new Set();
    let filterKeyword = '';

    // common media extensions to capture
    const MEDIA_REGEX = /\.(m3u8|mp4|m4s|m4v|webm|mpd|mov|flv|avi|mkv|mp3|m4a|aac|ogg|wav|flac)(\?|$)/i;

    const isTopWindow = window.top === window;
    const MSG_ACTION = 'MEDIA_EXTRACTOR_URL_CAPTURED';

    function checkAndAddUrl(url) {
        if (!url || typeof url !== 'string') return;
        try {
            const absoluteUrl = new URL(url, window.location.href).href;
            if (MEDIA_REGEX.test(absoluteUrl)) {
                if (isTopWindow) {
                    // top window: add to local set and refresh UI
                    if (!capturedUrls.has(absoluteUrl)) {
                        capturedUrls.add(absoluteUrl);
                        if (typeof updateUiList === 'function') {
                            updateUiList(capturedUrls, filterKeyword);
                        }
                    }
                } else {
                    // child iframe daemon: send captured URL up to window.top
                    window.top.postMessage(
                        {
                            action: MSG_ACTION,
                            url: absoluteUrl,
                        },
                        '*',
                    );
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

    // initialize network hooks from interceptor.js across all frames
    if (typeof initInterceptors === 'function') {
        initInterceptors(checkAndAddUrl);
    }

    // DOM ready initialization
    window.addEventListener('DOMContentLoaded', () => {
        if (isTopWindow) {
            // 1. top window listens for messages from child iframe daemons
            window.addEventListener('message', (event) => {
                if (event.data && event.data.action === MSG_ACTION && event.data.url) {
                    checkAndAddUrl(event.data.url);
                }
            });

            // render UI only in top window
            if (typeof createUi === 'function') {
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
        }

        // scan DOM elements and observe mutations across all frames
        scanMediaElements();
        if (document.body) {
            new MutationObserver(scanMediaElements).observe(document.body, { childList: true, subtree: true });
        }
    });
})();
