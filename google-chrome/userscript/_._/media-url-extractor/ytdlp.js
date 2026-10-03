// helper to build yt-dlp command with --add-header flags and output filename option
function buildYtdlpCommand(activeHeaders, url) {
    const headerValues = {
        Referer: window.location.href,
        Origin: window.location.origin,
        'User-Agent': navigator.userAgent,
        'Accept-Language': getNativeAcceptLanguage(),
    };

    let flags = '';
    Object.keys(activeHeaders).forEach((header) => {
        if (activeHeaders[header]) {
            flags += ` --add-header "${header}:${headerValues[header]}"`;
        }
    });

    const pageTitle = getSanitizedTitle();
    return `yt-dlp${flags} -o "${pageTitle}.%(ext)s" "${url}"`;
}
