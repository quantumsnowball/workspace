// interceptor.js
function initInterceptors(onUrlFound) {
    // Hook fetch API
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        onUrlFound(url);
        return originalFetch.apply(this, args);
    };

    // Hook XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        onUrlFound(url);
        return originalOpen.apply(this, arguments);
    };

    // Hook video src property
    const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (originalSrcDescriptor) {
        Object.defineProperty(HTMLMediaElement.prototype, 'src', {
            get: function () {
                return originalSrcDescriptor.get.call(this);
            },
            set: function (val) {
                onUrlFound(val);
                return originalSrcDescriptor.set.call(this, val);
            },
        });
    }
}
