/* eslint-disable no-undef */

// These constants are required to have Webpack correctly pass the content
// security policy (CSP) set up inside of the extension's webview

__webpack_nonce__ = window.__webpack_nonce__;
if (window.__webpack_public_path__) {
    __webpack_public_path__ = window.__webpack_public_path__;
}
