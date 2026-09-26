// ==UserScript==
// @name         YouTube Video Resolution Display
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  display youtube video resolution overlay
// @author       You
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// ==UserScript==

(function () {
    'use strict';

    // create overlay element
    const badge = document.createElement('div');
    badge.id = 'yt-res-badge';
    Object.assign(badge.style, {
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: '9999',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: '4px',
        pointerEvents: 'none',
        border: '1px solid rgba(0, 255, 204, 0.3)',
    });

    function updateResolution() {
        const video = document.querySelector('video');
        const player = document.getElementById('movie_player');

        if (!video || !player) return;

        // attach badge inside video player container
        if (!player.contains(badge)) {
            player.appendChild(badge);
        }

        // read resolution properties from html5 video element
        if (video.videoWidth && video.videoHeight) {
            badge.textContent = `${video.videoWidth} x ${video.videoHeight}`;
        } else {
            badge.textContent = 'loading...';
        }
    }

    // check resolution every second
    setInterval(updateResolution, 1000);
})();
