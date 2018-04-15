import util from '../util'

function getProxyTarget(reqUrl) {
    var matched = reqUrl.match(/^(http(s)?:)?\/\/(.*?)\//);
    if (matched && matched[0]) {
        return matched[0]
    }
    return reqUrl;
}

function iframeReq(options) {
    this.options = options;
    this.iframeReq = this.create();
}
iframeReq.prototype.send = function () {
    var _this = this,
        _iframeReq = this.iframeReq,
        options = this.options;
    return new Promise(function (resolve, reject) {
        _this.postMessage(options, resolve, reject)
    })
}
iframeReq.prototype.postMessage = function (options, resolve, reject) {
    var _this = this;
    this.iframeReq.onload = function () {
        try {
            _this.iframeReq.contentWindow.postMessage(JSON.stringify(
                options), _this.proxyTarget);
        } catch (e) {
            reject(e)
        }
    }
    window.addEventListener('message', function (e) {
        if (e.data.originId == _this.options.originId) {
            if (e.data.msg.status == 200) {
                return resolve(e.data.msg.data);
            } else {
                return reject(e.data.msg.data);
            }
        }
    }, false);
}
iframeReq.prototype.create = function () {
    var iframeId = 'sfetch-iframe-proxy-' + util.gid();
    var iframe = window.document.getElementById(iframeId);
    if (!iframe) {
        iframe = window.document.createElement('iframe');
        iframe.id = iframeId;
        iframe.style.display = 'none';
        window.document.body.appendChild(iframe);
    }
    this.proxyTarget = getProxyTarget(this.options.url);
    this.options.originId = iframeId;
    this.options.origin = location.protocol + location.host;
    iframe.src = this.proxyTarget + 'sfetch-proxy.html';
    return iframe;
}

export default iframeReq;
