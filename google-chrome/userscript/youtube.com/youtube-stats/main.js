// ==UserScript==
// @name         YouTube Video Stats
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  display youtube video resolution, fps, and raw full codecs
// @author       You
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// ==UserScript==

(function () {
    'use strict';

    // create overlay badge
    const badge = document.createElement('div');
    badge.id = 'yt-stats-badge';
    Object.assign(badge.style, {
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: '9999',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '10px',
        fontWeight: 'bold',
        padding: '6px 10px',
        borderRadius: '6px',
        pointerEvents: 'none',
        border: '0px',
        lineHeight: '1.4',
        whiteSpace: 'pre-line',
        textAlign: 'right',
        display: 'none', // hidden by default
    });

    let isStatsVisible = false;
    let lastTime = performance.now();
    let lastFrames = 0;
    let fps = 0;

    // create toggle button for player controls
    const statsBtn = document.createElement('button');
    statsBtn.id = 'yt-stats-toggle-btn';
    statsBtn.textContent = 'Stats';
    statsBtn.className = 'ytp-button';
    Object.assign(statsBtn.style, {
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#ffffff',
        opacity: '0.85',
        cursor: 'pointer',
        textAlign: 'center',
        lineHeight: '36px',
        verticalAlign: 'top',
        width: 'auto',
        padding: '0 8px',
    });

    statsBtn.addEventListener('click', () => {
        isStatsVisible = !isStatsVisible;
        badge.style.display = isStatsVisible ? 'block' : 'none';
        statsBtn.style.opacity = isStatsVisible ? '1' : '0.85';
        statsBtn.style.color = isStatsVisible ? '#3ea6ff' : '#ffffff';
    });

    function injectButton() {
        // target autoplay button or right control bar inside player
        const autoPlayBtn = document.querySelector('.ytp-autonav-toggle-button');
        const rightControls = document.querySelector('.ytp-right-controls');

        if (!document.getElementById('yt-stats-toggle-btn')) {
            if (autoPlayBtn && autoPlayBtn.parentElement) {
                // insert to the left of the auto play button container
                const container = autoPlayBtn.closest('.ytp-button') || autoPlayBtn;
                container.parentElement.insertBefore(statsBtn, container);
            } else if (rightControls) {
                // fallback to the start of right control bar
                rightControls.insertBefore(statsBtn, rightControls.firstChild);
            }
        }
    }

    function updateStats() {
        injectButton();

        if (!isStatsVisible) return;

        const video = document.querySelector('video');
        const player = document.getElementById('movie_player');

        if (!video || !player) return;

        // attach badge inside video player container
        if (!player.contains(badge)) {
            player.appendChild(badge);
        }

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

        // output format:
        badge.textContent = `${res}, ${fps} fps\n${vCodec}\n${aCodec}`;
    }

    setInterval(updateStats, 1000);
})();
