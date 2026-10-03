// ==UserScript==
// @name         media url extractor
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  captures m3u8 and mp4 urls with syntax highlighting and search filtering
// @author       you
// @match        *://*/*
// @run-at       document-start
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    const capturedUrls = new Set();
    let filterKeyword = '';

    // extract valid media url
    function checkAndAddUrl(url) {
        if (!url || typeof url !== 'string') return;
        try {
            const absoluteUrl = new URL(url, window.location.href).href;
            const cleanUrl = absoluteUrl.split('?')[0].toLowerCase();
            if (cleanUrl.includes('.m3u8') || cleanUrl.includes('.mp4')) {
                if (!capturedUrls.has(absoluteUrl)) {
                    capturedUrls.add(absoluteUrl);
                    updateUi();
                }
            }
        } catch (e) {
            // ignore invalid urls
        }
    }

    // helper function to highlight protocol, domain, slashes, and extensions
    function formatHighlightedUrl(rawUrl) {
        try {
            const parsed = new URL(rawUrl);

            // escape html strings to prevent xss
            const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            const protocol = escapeHtml(parsed.protocol); // e.g. "https:"
            const host = escapeHtml(parsed.host); // e.g. "s4.maxstream.org"
            let rest = escapeHtml(parsed.pathname + parsed.search + parsed.hash);

            // style highlights
            const styledProtocol = `<span style="color: #7f7f7f;">${protocol}</span>`;
            const styledHost = `<span style="color: #ff8f00; font-weight: bold;">${host}</span>`;
            const redSlash = `<span style="color: #ff5555; font-weight: bold;">/</span>`;

            // format remaining path (slashes -> red, extension -> yellow)
            rest = rest.replace(/\//g, redSlash).replace(/(\.m3u8|\.mp4)/gi, '<span style="color: #f1fa8c; font-weight: bold;">$1</span>');

            return `${styledProtocol}${redSlash}${redSlash}${styledHost}${rest}`;
        } catch (e) {
            // fallback for relative or unparseable urls
            const escaped = rawUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return escaped.replace(/\//g, '<span style="color: #ff5555; font-weight: bold;">/</span>').replace(/(\.m3u8|\.mp4)/gi, '<span style="color: #f1fa8c; font-weight: bold;">$1</span>');
        }
    }

    // hook fetch api
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        checkAndAddUrl(url);
        return originalFetch.apply(this, args);
    };

    // hook xmlhttprequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        checkAndAddUrl(url);
        return originalOpen.apply(this, arguments);
    };

    // hook video elements src property
    const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (originalSrcDescriptor) {
        Object.defineProperty(HTMLMediaElement.prototype, 'src', {
            get: function () {
                return originalSrcDescriptor.get.call(this);
            },
            set: function (val) {
                checkAndAddUrl(val);
                return originalSrcDescriptor.set.call(this, val);
            },
        });
    }

    // scan DOM for existing/new video tags
    function scanMediaElements() {
        document.querySelectorAll('video, source').forEach((el) => {
            if (el.src) checkAndAddUrl(el.src);
        });
    }

    const observer = new MutationObserver(scanMediaElements);

    // UI elements setup
    let fab, popup, listContainer, badge, filterInput;

    function createUi() {
        if (document.getElementById('media-extractor-fab')) return;

        // floating button
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
            width: '380px',
            maxHeight: '440px',
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
        });

        popup.innerHTML = `
            <div style="padding:10px;background:#2d2d2d;border-bottom:1px solid #444;display:flex;justify-content:space-between;align-items:center;">
                <b style="color:#fff;">captured media urls</b>
                <div>
                    <button id="media-extractor-clear" style="background:#dc3545;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;margin-right:4px;">clear</button>
                    <button id="media-extractor-close" style="background:#6c757d;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;">✕</button>
                </div>
            </div>
            <div style="padding:8px 10px;background:#252525;border-bottom:1px solid #333;">
                <input id="media-extractor-filter" type="text" placeholder="filter urls..." style="width:100%;box-sizing:border-box;background:#181818;color:#fff;border:1px solid #444;border-radius:4px;padding:4px 8px;font-family:monospace;font-size:11px;outline:none;" />
            </div>
            <div id="media-extractor-list" style="padding:10px;overflow-y:auto;max-height:330px;"></div>
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

        document.getElementById('media-extractor-clear').onclick = () => {
            capturedUrls.clear();
            updateUi();
        };

        filterInput.oninput = (e) => {
            filterKeyword = e.target.value.toLowerCase().trim();
            updateUi();
        };
    }

    function updateUi() {
        if (!badge || !listContainer) return;

        // filter captured urls based on keyword
        const filteredUrls = Array.from(capturedUrls).filter((url) => url.toLowerCase().includes(filterKeyword));

        badge.textContent = capturedUrls.size;
        listContainer.innerHTML = '';

        if (capturedUrls.size === 0) {
            listContainer.innerHTML = '<div style="color:#aaa;text-align:center;">no media urls captured yet</div>';
            return;
        }

        if (filteredUrls.length === 0) {
            listContainer.innerHTML = '<div style="color:#aaa;text-align:center;">no matching urls found</div>';
            return;
        }

        filteredUrls.forEach((url) => {
            const row = document.createElement('div');
            Object.assign(row.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                padding: '6px',
                backgroundColor: '#2b2b2b',
                borderRadius: '4px',
                wordBreak: 'break-all',
            });

            const urlText = document.createElement('span');
            // render highlighted html
            urlText.innerHTML = formatHighlightedUrl(url);
            urlText.style.marginRight = '8px';
            urlText.style.maxHeight = '50px';
            urlText.style.overflow = 'hidden';

            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'copy';
            Object.assign(copyBtn.style, {
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
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

    // initialize DOM UI once ready
    window.addEventListener('DOMContentLoaded', () => {
        createUi();
        scanMediaElements();
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
