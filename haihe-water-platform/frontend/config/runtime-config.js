(function () {
    const STORAGE_KEY = 'haihe.apiBaseUrl';
    const localHosts = new Set(['localhost', '127.0.0.1', '::1']);

    function normalizeBaseUrl(value) {
        return String(value || '').trim().replace(/\/+$/, '');
    }

    function getConfiguredBaseUrl() {
        let queryBaseUrl = '';
        let storedBaseUrl = '';

        try {
            const params = new URLSearchParams(window.location.search);
            queryBaseUrl = normalizeBaseUrl(
                params.get('apiBaseUrl') || params.get('apiOrigin') || ''
            );
            if (queryBaseUrl) {
                window.localStorage.setItem(STORAGE_KEY, queryBaseUrl);
            }
        } catch (error) {
            console.warn('Unable to read apiBaseUrl from query string.', error);
        }

        try {
            storedBaseUrl = normalizeBaseUrl(window.localStorage.getItem(STORAGE_KEY));
        } catch (error) {
            storedBaseUrl = '';
        }

        const siteConfig = window.HAIHE_SITE_CONFIG || {};
        const configBaseUrl = normalizeBaseUrl(siteConfig.apiBaseUrl || siteConfig.apiOrigin || '');

        return queryBaseUrl || configBaseUrl || storedBaseUrl;
    }

    const isFileProtocol = window.location.protocol === 'file:';
    const isLocalHost = localHosts.has(window.location.hostname);
    const isStaticHost = !isFileProtocol && !isLocalHost;

    let apiBaseUrl = getConfiguredBaseUrl();
    if (!apiBaseUrl) {
        if (isFileProtocol) {
            apiBaseUrl = 'http://127.0.0.1:5001';
        } else if (isLocalHost) {
            apiBaseUrl = window.location.origin;
        }
    }

    function isApiPath(pathname) {
        return pathname === '/api' || pathname.startsWith('/api/');
    }

    function resolveApi(path) {
        const normalizedPath = String(path || '').trim();
        if (!normalizedPath) {
            return apiBaseUrl;
        }
        if (/^https?:\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }
        const pathWithSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
        return apiBaseUrl ? `${apiBaseUrl}${pathWithSlash}` : pathWithSlash;
    }

    function getRequestUrl(input) {
        if (typeof input === 'string' || input instanceof URL) {
            return String(input);
        }
        if (input instanceof Request) {
            return input.url;
        }
        return '';
    }

    function targetsApi(url) {
        if (!url) {
            return false;
        }
        if (url.startsWith('/api')) {
            return true;
        }

        try {
            const parsed = new URL(url, window.location.origin);
            return parsed.origin === window.location.origin && isApiPath(parsed.pathname);
        } catch (error) {
            return false;
        }
    }

    function rewriteApiRequest(input) {
        const rawUrl = getRequestUrl(input);
        if (!apiBaseUrl || !targetsApi(rawUrl)) {
            return null;
        }

        if (rawUrl.startsWith('/api')) {
            return `${apiBaseUrl}${rawUrl}`;
        }

        const parsed = new URL(rawUrl, window.location.origin);
        return `${apiBaseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    let noticeShown = false;

    function createNoticeElement() {
        const element = document.createElement('div');
        element.id = 'haihe-runtime-notice';
        element.innerHTML = [
            '<div style="font-weight:600;margin-bottom:4px;">静态部署提示</div>',
            '<div style="line-height:1.5;font-size:13px;">当前页面运行在静态托管环境，尚未配置后端地址。请编辑 <code>config/site.config.js</code> 中的 <code>apiBaseUrl</code>。</div>',
            '<button type="button" style="margin-top:10px;padding:6px 10px;border:0;border-radius:999px;background:#0ea5e9;color:#fff;cursor:pointer;">知道了</button>'
        ].join('');
        element.style.position = 'fixed';
        element.style.right = '16px';
        element.style.bottom = '16px';
        element.style.maxWidth = '360px';
        element.style.padding = '14px 16px';
        element.style.borderRadius = '14px';
        element.style.background = 'rgba(15, 23, 42, 0.92)';
        element.style.border = '1px solid rgba(14, 165, 233, 0.35)';
        element.style.boxShadow = '0 18px 48px rgba(2, 8, 23, 0.35)';
        element.style.color = '#e2e8f0';
        element.style.backdropFilter = 'blur(12px)';
        element.style.zIndex = '9999';

        const button = element.querySelector('button');
        button.addEventListener('click', function () {
            element.remove();
        });

        return element;
    }

    function showBackendNotice() {
        if (!isStaticHost || apiBaseUrl || noticeShown) {
            return;
        }

        noticeShown = true;

        const render = function () {
            if (document.getElementById('haihe-runtime-notice')) {
                return;
            }
            document.body.appendChild(createNoticeElement());
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', render, { once: true });
            return;
        }

        render();
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = function patchedFetch(input, init) {
        const rewrittenUrl = rewriteApiRequest(input);
        let nextInput = input;

        if (rewrittenUrl) {
            if (input instanceof Request) {
                nextInput = new Request(rewrittenUrl, input);
            } else {
                nextInput = rewrittenUrl;
            }
        } else if (targetsApi(getRequestUrl(input)) && !apiBaseUrl) {
            showBackendNotice();
        }

        return originalFetch(nextInput, init);
    };

    window.HAIHE_RUNTIME = {
        apiBaseUrl,
        isFileProtocol,
        isLocalHost,
        isStaticHost,
        resolveApi,
        showBackendNotice
    };

    if (isStaticHost && !apiBaseUrl) {
        showBackendNotice();
    }
})();
