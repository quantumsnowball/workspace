// ==UserScript==
// @name         YouTube Video Stats
// @namespace    http://tampermonkey.net/
// @version      1.4
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
    });

    let lastTime = performance.now();
    let lastFrames = 0;
    let fps = 0;

    function updateStats() {
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
