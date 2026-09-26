// ==UserScript==
// @name         YouTube Video Stats
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  display youtube video resolution, fps, and codecs
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '6px 10px',
        borderRadius: '6px',
        pointerEvents: 'none',
        border: '1px solid rgba(0, 255, 204, 0.3)',
        lineHeight: '1.4',
        whiteSpace: 'pre-line',
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
        const quality = video.getVideoPlaybackQuality
            ? video.getVideoPlaybackQuality()
            : null;
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
        const res =
            video.videoWidth && video.videoHeight
                ? `${video.videoWidth} x ${video.videoHeight}`
                : 'loading...';

        // extract codecs
        let vCodec = 'vp9';
        let aCodec = 'opus';

        if (player.getStatsForNerds) {
            const stats = player.getStatsForNerds();
            if (stats && stats.codecs) {
                const parts = stats.codecs.split('/');
                if (parts[0])
                    vCodec = parts[0].trim().split('.')[0].toLowerCase();
                if (parts[1])
                    aCodec = parts[1].trim().split('.')[0].toLowerCase();
            }
        }

        // output format:
        // 2560 x 1080, 60 fps
        // vp9, opus
        badge.textContent = `${res}, ${fps} fps\n${vCodec}, ${aCodec}`;
    }

    setInterval(updateStats, 1000);
})();
