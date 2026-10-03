// ==UserScript==
// @name         media url extractor
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  captures m3u8 and mp4 urls without opening devtools
// @author       you
// @match        *://*/*
// @run-at       document-start
// @grant        GM_setClipboard
// @require      file:///home/<username>/.config/workspace/google-chrome/userscript/_._/media-url-extractor/utils.js
// @require      file:///home/<username>/.config/workspace/google-chrome/userscript/_._/media-url-extractor/interceptor.js
// @require      file:///home/<username>/.config/workspace/google-chrome/userscript/_._/media-url-extractor/ui.js
// @require      file:///home/<username>/.config/workspace/google-chrome/userscript/_._/media-url-extractor/main.js
// ==/UserScript==

// README
//
// Create a new user script in Tempermonkey. Then copy and paste the content of
// this file into the editor and save. Replace <username> with the real username.
// Point the require file path to the correct local file path. Also need to enable
// "Allow access to file URLs" in extensions settings in Chrome.
