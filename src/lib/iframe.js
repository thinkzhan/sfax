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

    return new Promise(function(resolve, reject) {
        _this.postMessage(options, resolve, reject)
    })
}

iframeReq.prototype.postMessage = function (options, resolve, reject) {
    var _this = this;

    if (_this.iframeReq.attachEvent){
        _this.iframeReq.attachEvent("onload", function(){
            try {
                _this.iframeReq.contentWindow.postMessage(JSON.stringify(
                    options), _this.proxyTarget);
            } catch (e) {
                reject(e)
            }
        });
    } else {
        _this.iframeReq.onload = function () {
            try {
                _this.iframeReq.contentWindow.postMessage(JSON.stringify(
                    options), _this.proxyTarget);
            } catch (e) {
                reject(e)
            }
        }
    }

    util.addEvent('message', function(e) {
        var data = JSON.parse(e.data);
        if (data.originId == _this.options.originId) {
            if (data.msg.status == 200) {
                return resolve(data.msg.data);
            } else {
                return reject(data.msg.data);
            }
        }
    }, window);
}

iframeReq.prototype.create = function () {
    var iframeId = 'sfax-iframe-proxy-' + util.gid();

    var iframe = window.document.getElementById(iframeId);
    if (!iframe) {
        iframe = window.document.createElement('iframe');
        iframe.id = iframeId;
        iframe.style.display = 'none';
        window.document.body.appendChild(iframe);
    }

    this.proxyTarget = getProxyTarget(this.options.url);
    this.options.originId = iframeId;
    this.options.origin = location.protocol + '//' + location.host;

    iframe.src = this.proxyTarget + 'sfax-proxy.html';

    return iframe;
}

export default iframeReq;
