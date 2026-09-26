// ==UserScript==
// @name         YouTube Video Stats
// @namespace    http://tampermonkey.net/
// @version      1.6
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

    // create toggle button styled like youtube pill buttons
    const statsBtn = document.createElement('button');
    statsBtn.id = 'yt-stats-toggle-btn';
    statsBtn.textContent = 'Stats';
    Object.assign(statsBtn.style, {
        marginRight: '8px',
        padding: '0 12px',
        height: '36px',
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--yt-spec-text-primary, #fff)',
        backgroundColor: 'var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1))',
        border: 'none',
        borderRadius: '18px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    statsBtn.addEventListener('click', () => {
        isStatsVisible = !isStatsVisible;
        badge.style.display = isStatsVisible ? 'block' : 'none';
        statsBtn.style.backgroundColor = isStatsVisible ? 'var(--yt-spec-text-primary, #fff)' : 'var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1))';
        statsBtn.style.color = isStatsVisible ? 'var(--yt-spec-base-background, #000)' : 'var(--yt-spec-text-primary, #fff)';
    });

    function injectButton() {
        // target the like button container or the main top-level action buttons
        const likeContainer = document.querySelector('#segment-like-button') || document.querySelector('#top-level-buttons-computed > *');

        if (likeContainer && likeContainer.parentElement && !document.getElementById('yt-stats-toggle-btn')) {
            likeContainer.parentElement.insertBefore(statsBtn, likeContainer);
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
