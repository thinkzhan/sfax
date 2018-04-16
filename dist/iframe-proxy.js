(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
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

util.addEvent('message', function(e){
    try {
        var data = JSON.parse(e.data);
        new xhr(data).send().then(function(res) {
            window.parent.postMessage(JSON.stringify({
                originId: data.originId,
                msg: {
                    status: 200,
                    data: res
                }
            }), data.origin);

        }, function(res) {
            window.parent.postMessage(JSON.stringify({
                originId: data.originId,
                msg: {
                    status: 400,
                    data: res
                }
            }), data.origin);
        });

    } catch (e) {

    }

}, window);

})));
