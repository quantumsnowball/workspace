// interceptor.js
function initInterceptors(onUrlCaptured) {
    // -------------------------------------------------------------------------
    // 1. Fetch Interceptor (Captures initial request & final terminal response)
    // -------------------------------------------------------------------------
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const requestUrl = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        if (requestUrl) onUrlCaptured(requestUrl);

        try {
            const response = await originalFetch.apply(this, args);
            // Captures the FINAL destination URL after all 301/302 hops complete
            if (response && response.url) {
                onUrlCaptured(response.url);
            }
            return response;
        } catch (err) {
            throw err;
        }
    };

    // -------------------------------------------------------------------------
    // 2. XHR Interceptor (Captures initial request & final terminal response)
    // -------------------------------------------------------------------------
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._customRequestUrl = url;
        return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('loadend', () => {
            try {
                if (this._customRequestUrl) onUrlCaptured(this._customRequestUrl);
                // Captures the FINAL destination URL after all 301/302 hops complete
                if (this.responseURL) {
                    onUrlCaptured(this.responseURL);
                }
            } catch (e) {}
        });
        return originalSend.apply(this, args);
    };

    // -------------------------------------------------------------------------
    // 3. PerformanceObserver (Captures EVERY intermediate hop in a redirect chain)
    // -------------------------------------------------------------------------
    if (typeof PerformanceObserver !== 'undefined') {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    // Browser records every URL resolved during network fetching
                    if (entry.name) {
                        onUrlCaptured(entry.name);
                    }
                });
            });
            // Listen for resource timing entries
            observer.observe({ type: 'resource', buffered: true });
        } catch (e) {
            // Fallback for older browsers
        }
    }
}
