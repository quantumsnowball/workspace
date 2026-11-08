// ==UserScript==
// @name         EDID Editor Hex Copy Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a button to copy clean EDID hex content to clipboard without row offsets
// @match        https://thyge.github.io/edid-editor/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use me strict';

    // create copy button element
    const btn = document.createElement('button');
    btn.textContent = 'Copy Hex';
    btn.style.cssText = 'margin: 8px 0; padding: 6px 12px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc; background: #f0f0f0; font-weight: bold;';

    btn.addEventListener('click', () => {
        // extract all byte elements excluding line headers (.w-8)
        const byteElements = document.querySelectorAll('.font-mono span[title^="Offset 0x"]');
        const hexBytes = Array.from(byteElements)
            .map((el) => el.textContent.trim())
            .filter((text) => text.length > 0);

        // format into lines of 8 bytes separated by spaces
        const lines = [];
        for (let i = 0; i < hexBytes.length; i += 8) {
            lines.push(hexBytes.slice(i, i + 8).join(' '));
        }
        const formattedHex = lines.join('\n');

        // copy to clipboard with feedback
        const copyAction = typeof GM_setClipboard !== 'undefined' ? () => GM_setClipboard(formattedHex) : () => navigator.clipboard.writeText(formattedHex);
        copyAction();
        const origText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = origText;
        }, 1500);
    });

    // inject button above hex viewer container
    const observer = new MutationObserver(() => {
        const targetContainer = document.querySelector('.font-mono.text-xs');
        if (targetContainer && !document.getElementById('edid-copy-btn')) {
            btn.id = 'edid-copy-btn';
            targetContainer.parentNode.insertBefore(btn, targetContainer);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
