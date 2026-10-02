// ==UserScript==
// @name         YouTube Video Stats
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  display youtube video resolution, fps, and raw full codecs with dynamic viewport adaptation
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
        gap: '8px', // space between each stat span
        height: '100%',
        padding: '0 12px',
        fontSize: '14px',
        fontWeight: 'normal',
        color: '#ffffff',
        opacity: '1.0',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
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
    resSpan.style.color = '#8effff'; // bright cyan

    const fpsSpan = document.createElement('span');

    const vCodecSpan = document.createElement('span');
    vCodecSpan.style.color = '#ffa534'; // bright orange

    const aCodecSpan = document.createElement('span');
    aCodecSpan.style.color = '#da6969'; // dim red

    // assemble inline structure
    statsContainer.appendChild(resSpan);
    statsContainer.appendChild(fpsSpan);
    statsContainer.appendChild(vCodecSpan);
    statsContainer.appendChild(aCodecSpan);

    let lastTime = performance.now();
    let lastFrames = 0;
    let fps = 0;
    let currentSrc = '';

    // helper function to trim codec strings
    function formatCodec(str, maxLen = 6) {
        if (!str || str === 'N/A') return 'N/A';
        return str.length > maxLen ? `${str.slice(0, maxLen)}..` : str;
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

        // detect media source/video change and reset state immediately
        if (video.currentSrc !== currentSrc) {
            currentSrc = video.currentSrc;
            lastFrames = 0;
            lastTime = performance.now();
            fps = -1;
        }

        // calculate current fps
        const now = performance.now();
        const quality = video.getVideoPlaybackQuality ? video.getVideoPlaybackQuality() : null;
        if (quality) {
            const totalFrames = quality.totalVideoFrames;
            const elapsed = (now - lastTime) / 1000;
            if (elapsed >= 1) {
                const calculatedFps = Math.round((totalFrames - lastFrames) / elapsed);

                // validate fps range (0 to 240 fps)
                if (calculatedFps >= 0 && calculatedFps <= 240 && lastFrames <= totalFrames) {
                    fps = calculatedFps;
                } else {
                    // reset frame anchor on invalid jump/seek
                    fps = -1;
                }

                lastFrames = totalFrames;
                lastTime = now;
            }
        }

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

        // detect player container width
        const playerWidth = player.clientWidth;
        const isTinyViewport = playerWidth < 960;
        const isSmallViewport = playerWidth < 1280;

        // format resolution
        let resText = 'loading...';
        if (video.videoWidth && video.videoHeight) {
            resText = isSmallViewport ? `${video.videoHeight}p` : `${video.videoWidth} x ${video.videoHeight}`;
        }

        // format sanitized fps
        const displayFps = fps >= 0 && fps <= 66 ? fps : '-';
        const fpsText = isSmallViewport ? `${displayFps}` : `${displayFps} fps`;

        // format codecs with dynamic max length (4 on small viewports, 10 on larger)
        const codecMaxLen = isSmallViewport ? 4 : 10;

        // update DOM node contents directly
        resSpan.textContent = resText;
        fpsSpan.textContent = fpsText;
        fpsSpan.style.color = fps >= 50 ? '#65ff6a' : '#ffeb3b'; // bright green / bright yellow

        // hide codecs on tiny viewports (< 640px)
        if (isTinyViewport) {
            vCodecSpan.style.display = 'none';
            aCodecSpan.style.display = 'none';
        } else {
            vCodecSpan.style.display = 'inline';
            aCodecSpan.style.display = 'inline';

            vCodecSpan.textContent = formatCodec(vCodec, codecMaxLen);
            vCodecSpan.title = vCodec; // show full string on mouse hover

            aCodecSpan.textContent = formatCodec(aCodec, codecMaxLen);
            aCodecSpan.title = aCodec; // show full string on mouse hover
        }
    }

    setInterval(updateStats, 1000);
})();
