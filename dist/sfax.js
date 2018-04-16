(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.sfax = factory());
}(this, (function () { 'use strict';

var isBasic = function(v) {
    return v == null || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string' || typeof v === 'function';
};

function completeUrl(url) {
    if (url.charAt(0) === '/') {
        if (url.charAt(1) === '/') {
            url = window.location.protocol + url;
        } else {
            url = window.location.protocol + '//' + window.location.host + url;
        }
    }
    return url;
}

var util = {

    gid: (function() {
        var id = 0;
        return function() {
            return id++;
        }
    })(),

    merge: function(source, dist) {
        var result = {};

        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                result[key] = source[key];
            }
        }

        for (var key in dist) {
            if (Object.prototype.hasOwnProperty.call(dist, key)) {
                result[key] = dist[key];
            }
        }
        return result
    },

    isLowerIe9: function() {
        var b_version = navigator.appVersion;
        var version = b_version.split(';');
        var trim_Version = version[1].replace(/[ ]/g, '');

        if (navigator.userAgent.indexOf('MSIE') !== -1 && (trim_Version == 'MSIE9.0' || trim_Version == 'MSIE8.0')) {
            return true;
        }

        return false;
    },

    isCrossDomain: function(url) {
        url = completeUrl(url);
        var rurl = /^([\w.+-]+:)?(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/;
        var locParts = rurl.exec(window.location.href.toLowerCase()) || [];
        var curParts = rurl.exec(url.toLowerCase());
        if (curParts[1] === undefined) {
            curParts[1] = locParts[1];
        }
        return !!(curParts &&
            (
                curParts[1] !== locParts[1]
                || curParts[2] !== locParts[2]
                || (curParts[3] || (curParts[1] === 'http:' ? '80' : '443'))
                    !== (locParts[3] || (locParts[1] === 'http:' ? '80' : '443'))
            )
        );
    },

    flatParams: function(obj) {
        // if (type(obj) === 'formdata') return obj;
        if (obj == null) return '';
        if (typeof obj === 'array') return JSON.stringify(obj);
        if (isBasic(obj)) return String(obj);
        var encoded = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                encoded.push(encodeURIComponent(prop) + '=' + encodeURIComponent(isBasic(obj[prop]) ? String(obj[prop]) : JSON.stringify(obj[prop])));
            }
        }
        return encoded.join('&');
    },

    addEvent: function(event, handler, target) {
        target = target || window;
        if (window.addEventListener) {
            target.addEventListener(event, handler, false);
        } else {
            target.attachEvent('on' + event, handler);
        }
    }
};

function xhr(options) {
    this.options = options;
    this.xhr = this.create();
    // options.headers['X-Requested-With'] = 'XMLHttpRequest';
}
xhr.prototype.send = function () {
    var _this = this,
        xhr = this.xhr,
        options = this.options;
    return new Promise(function (resolve, reject) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    return resolve(JSON.parse(xhr.responseText));
                }
            }
        };
        try {
            xhr.onerror = function () {
                return _this._handleError('error', reject);
            };
            xhr.ontimeout = function () {
                return _this._handleError('timeout', reject);
            };
            xhr.onabort = function () {
                return _this._handleError('abort', reject);
            };
        } catch (e) {

        }
        var notGet = (typeof options.type === 'string' && options.type
            .toLowerCase() !== 'get');
        var paramData = util.flatParams(options.data);
        if (notGet && /multipart\/form-data/i.test(options.contentType)) {
            paramData = options.data;
        } else if (notGet && /application\/json/i.test(options.contentType)) {
            try {
                paramData = JSON.stringify(options.data);
            } catch (e) {
                throw new Error('设置了application/json，数据格式不符')
            }
        }
        xhr.open(options.type, options.type === 'get' ? options.url +
            '?' + paramData : options.url, true);
        if (options.withCredentials && util.isCrossDomain(options.url)) {
            xhr.withCredentials = true;
        }
        if ((options.data != null)) {
            options.headers['Content-Type'] = options.contentType;
        }
        if (options.timeout) {
            xhr.timeout = options.timeout;
        }
        for (var header in options.headers) {
            if (Object.prototype.hasOwnProperty.call(options.headers,
                    header)) {
                xhr.setRequestHeader(header, options.headers[header]);
            }
        }
        if (notGet) {
            xhr.send(paramData);
        } else {
            xhr.send();
        }
    })
};
xhr.prototype.create = function () {
    return (window.ActiveXObject === undefined || window.document.documentMode >
        8) ? (function createXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch (e) {}
    })() : (function createActive() {
        try {
            return new window.ActiveXObject('Microsoft.XMLHTTP'); // ie8 open跨域没有权限
        } catch (e) {}
    })()
};
xhr.prototype._handleError = function (reason, reject) {
    return reject({
        reason: reason,
        status: this.xhr.status
    });
};

function xdr(options) {
    this.options = options;
    this.xdr = this.create();
}
xdr.prototype.send = function () {
    var _this = this,
        xdr = this.xdr,
        options = this.options;
    return new Promise(function (resolve, reject) {
        xdr.onload = function () {
            return resolve(JSON.parse(xdr.responseText));
        };
        xdr.onerror = function () {
            return _this._handleError('error', reject);
        };
        xdr.ontimeout = function () {
            return _this._handleError('timeout', reject);
        };
        var notGet = (typeof options.type === 'string' && options.type
            .toLowerCase() !== 'get');
        var paramData = util.flatParams(options.data);
        if (notGet && /multipart\/form-data/i.test(options.contentType)) {
            paramData = options.data;
        } else if (notGet && /application\/json/i.test(options.contentType)) {
            try {
                paramData = JSON.stringify(options.data);
            } catch (e) {
                throw new Error('设置了application/json，数据格式不符')
            }
        }
        xdr.open(options.type, options.type === 'get' ? options.url +
            '?' + paramData : options.url);
        if (options.timeout) {
            xdr.timeout = options.timeout;
        }
        // if (options.contentType) {
        //     xdr.contentType = options.contentType;
        // }
        if (notGet) {
            xdr.send(paramData);
        } else {
            xdr.send();
        }
    })
};
xdr.prototype.create = function () {
    return new XDomainRequest()
};
xdr.prototype._handleError = function (reason, reject) {
    return reject({
        reason: reason,
        status: this.xdr.status
    });
};

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
        _this.postMessage(options, resolve, reject);
    })
};

iframeReq.prototype.postMessage = function (options, resolve, reject) {
    var _this = this;

    if (_this.iframeReq.attachEvent){
        _this.iframeReq.attachEvent("onload", function(){
            try {
                _this.iframeReq.contentWindow.postMessage(JSON.stringify(
                    options), _this.proxyTarget);
            } catch (e) {
                reject(e);
            }
        });
    } else {
        _this.iframeReq.onload = function () {
            try {
                _this.iframeReq.contentWindow.postMessage(JSON.stringify(
                    options), _this.proxyTarget);
            } catch (e) {
                reject(e);
            }
        };
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
};

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
};

function jsonp(options) {
    this.options = options;
    this.jsonp = this.create();
}
jsonp.prototype.send = function () {
    var _this = this,
        _jsonp = this.jsonp;

    return new Promise(function (resolve, reject) {
        window[_this.name] = function (json) {
            window[_this.name] = undefined;
            var elem = document.getElementById(_jsonp.id);
            _this.removeElem(elem);
            resolve(json);
        };

        var head = document.getElementsByTagName("head");
        if (head && head[0]) {
            head[0].appendChild(_this.jsonp);
        }
    })
};

jsonp.prototype.create = function () {
    var name = 'jsonp_' + (+new Date());
    var url = this.options.url + (this.options.url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + name;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.id = "id_" + name;
    this.name = name;

    return script;
};

jsonp.prototype.removeElem = function (elem) {
    var parent = elem.parentNode;
    if (parent && parent.nodeType !== 11) {
        parent.removeChild(elem);
    }
};

function sfax(options) {
    var dftOptions = {
        type: 'get',
        withCredentials: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: {},
        jsonp: false
    };

    options = util.merge(dftOptions, options);

    if (!/^(http|\/[^\/]|\/\/)/.test(options.url)) {
        options.url = sfax.baseUrl + '/' + options.url;
    }
    if (/^\/[^\/]/.test(options.url)) {
        options.url = location.protocol + '//' + location.host + options.url;
    } else if (/^\/\//.test(options.url)) {
        options.url = location.protocol + options.url;
    }

    if (options.jsonp) {
        return new jsonp(options).send()
    }
    if (util.isLowerIe9()) {
        if (util.isCrossDomain(options.url)) {
            if (options.withCredentials) {
                // console.log('need iframe');
                return new iframeReq(options).send()
            } else {
                // console.log('need xdr');
                return new xdr(options).send()
            }
        } else {
            return new xhr(options).send()
        }
    } else {
        return new xhr(options).send()
    }
}

sfax.baseUrl = '';

return sfax;

})));
