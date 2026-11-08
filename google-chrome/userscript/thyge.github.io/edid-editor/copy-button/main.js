// ==UserScript==
// @name         EDID Editor Hex Copy Button
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a button to copy clean EDID hex content to clipboard without row offsets
// @match        https://thyge.github.io/edid-editor/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use me strict';

    // create copy button element
    const btn = document.createElement('button');
    btn.textContent = 'Copy Hex';
    btn.style.cssText = `
        display: block;
        width: calc(100% - 10px);
        box-sizing: border-box;
        margin: 5px 5px 0px 5px;
        padding: 5px;
        cursor: pointer;
        border-radius: 6px;
        border: 1px solid #ccc;
        background: #f0f0f0;
        font-weight: bold;
        font-size: 14px;
        transition: background-color 0.2s ease, border-color 0.2s ease;
    `;

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
