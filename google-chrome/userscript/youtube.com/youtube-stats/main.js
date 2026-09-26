// ==UserScript==
// @name         YouTube Video Stats
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  display youtube video resolution, fps, and raw full codecs in high-contrast bottom control bar
// @author       You
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// ==UserScript==

(function () {
    'use strict';

    // create stats container for bottom control bar
    const statsContainer = document.createElement('div');
    statsContainer.id = 'yt-bottom-stats-bar';
    Object.assign(statsContainer.style, {
        display: 'inline-flex',
        alignItems: 'center',
        height: '100%',
        padding: '0 10px',
        fontSize: '14px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#ffffff',
        opacity: '1.0',
        pointerEvents: 'none',
        whiteSpace: 'pre', // preserve literal whitespace characters between spans
        // heavy black outline and deep blur shadow for max contrast on pure white video frames
        textShadow: `
            0 0 2px #000000,
            0 0 4px #000000,
            1px 1px 0 #000000,
            -1px -1px 0 #000000,
            1px -1px 0 #000000,
            -1px 1px 0 #000000,
            0 2px 6px rgba(0, 0, 0, 0.95)
        `,
    });

    // create persistent inline elements using extra bright colors
    const resSpan = document.createElement('span');
    resSpan.style.color = '#e0f7fa'; // ultra light cyan

    const fpsSpan = document.createElement('span');

    const vCodecSpan = document.createElement('span');
    vCodecSpan.style.color = '#ffe0b2'; // ultra light orange

    const aCodecSpan = document.createElement('span');
    aCodecSpan.style.color = '#e1f5fe'; // ultra light blue

    // assemble inline structure
    statsContainer.appendChild(document.createTextNode(' | '));
    statsContainer.appendChild(resSpan);
    statsContainer.appendChild(document.createTextNode(' | '));
    statsContainer.appendChild(fpsSpan);
    statsContainer.appendChild(document.createTextNode(' | '));
    statsContainer.appendChild(vCodecSpan);
    statsContainer.appendChild(document.createTextNode(' | '));
    statsContainer.appendChild(aCodecSpan);
    statsContainer.appendChild(document.createTextNode(' | '));

    let lastTime = performance.now();
    let lastFrames = 0;
    let fps = 0;

    // helper function to trim codec strings
    function formatCodec(str) {
        if (!str || str === 'N/A') return 'N/A';
        return str.length > 6 ? `${str.slice(0, 6)}..` : str;
    }

    function injectStatsBar() {
        // locate autoplay button or right control bar container
        const autoPlayBtn = document.querySelector('.ytp-autonav-toggle-button');
        const rightControls = document.querySelector('.ytp-right-controls');

        if (!document.getElementById('yt-bottom-stats-bar')) {
            if (autoPlayBtn && autoPlayBtn.parentElement) {
                // insert to the left of autoplay toggle
                const container = autoPlayBtn.closest('.ytp-button') || autoPlayBtn;
                container.parentElement.insertBefore(statsContainer, container);
            } else if (rightControls) {
                // fallback to start of right control bar
                rightControls.insertBefore(statsContainer, rightControls.firstChild);
            }
        }
    }

    function updateStats() {
        injectStatsBar();

        const video = document.querySelector('video');
        const player = document.getElementById('movie_player');

        if (!video || !player) return;

        // calculate current fps
        const now = performance.now();
        const quality = video.getVideoPlaybackQuality ? video.getVideoPlaybackQuality() : null;
        if (quality) {
            const totalFrames = quality.totalVideoFrames;
            const elapsed = (now - lastTime) / 1000;
            if (elapsed >= 1) {
                fps = Math.round((totalFrames - lastFrames) / elapsed);
                lastFrames = totalFrames;
                lastTime = now;
            }
        }

        // get resolution
        const res = video.videoWidth && video.videoHeight ? `${video.videoWidth} x ${video.videoHeight}` : 'loading...';

        // extract full codec string as reported by youtube
        let vCodec = 'N/A';
        let aCodec = 'N/A';
        if (player.getStatsForNerds) {
            const stats = player.getStatsForNerds();
            if (stats && stats.codecs) {
                const parts = stats.codecs.split('/');
                if (parts[0]) vCodec = parts[0].trim();
                if (parts[1]) aCodec = parts[1].trim();
            }
        }

        // update DOM node contents directly
        resSpan.textContent = res;
        fpsSpan.textContent = `${fps} fps`;
        fpsSpan.style.color = fps >= 50 ? '#b9f6ca' : '#fff59d'; // bright mint green / pale yellow

        vCodecSpan.textContent = formatCodec(vCodec);
        vCodecSpan.title = vCodec; // show full string on mouse hover

        aCodecSpan.textContent = formatCodec(aCodec);
        aCodecSpan.title = aCodec; // show full string on mouse hover
    }

    setInterval(updateStats, 1000);
})();
