// ==UserScript==
// @name         YouTube Video Stats
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  display youtube video resolution, fps, and raw full codecs trimmed in bottom control bar
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
        whiteSpace: 'nowrap',
    });

    // create persistent inline elements
    const resSpan = document.createElement('span');
    resSpan.style.color = '#4fc3f7';

    const fpsSpan = document.createElement('span');

    const vCodecSpan = document.createElement('span');
    vCodecSpan.style.color = '#ff8a65';

    const aCodecSpan = document.createElement('span');
    aCodecSpan.style.color = '#81d4fa';

    // assemble inline structure
    statsContainer.appendChild(resSpan);
    statsContainer.appendChild(document.createTextNode(' @ '));
    statsContainer.appendChild(fpsSpan);
    statsContainer.appendChild(document.createTextNode(' ['));
    statsContainer.appendChild(vCodecSpan);
    statsContainer.appendChild(document.createTextNode(', '));
    statsContainer.appendChild(aCodecSpan);
    statsContainer.appendChild(document.createTextNode(']'));

    let lastTime = performance.now();
    let lastFrames = 0;
    let fps = 0;

    // helper function to trim codec strings
    function formatCodec(str) {
        if (!str || str === 'N/A') return 'N/A';
        return str.length > 10 ? `${str.slice(0, 10)}...` : str;
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
        fpsSpan.style.color = fps >= 50 ? '#4caf50' : '#ffb74d';

        vCodecSpan.textContent = formatCodec(vCodec);
        vCodecSpan.title = vCodec; // show full string on mouse hover

        aCodecSpan.textContent = formatCodec(aCodec);
        aCodecSpan.title = aCodec; // show full string on mouse hover
    }

    setInterval(updateStats, 1000);
})();
