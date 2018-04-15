import util from '../util'

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
        xhr.onerror = function () {
            return _this._handleError('error', reject);
        };
        xhr.ontimeout = function () {
            return _this._handleError('timeout', reject);
        };
        xhr.onabort = function () {
            return _this._handleError('abort', reject);
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
        xhr.open(options.type, options.type === 'get' ? options.url +
            '?' + paramData : options.url, true);
        if (options.withCredentials) {
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
}
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
}
xhr.prototype._handleError = function (reason, reject) {
    return reject({
        reason: reason,
        status: this.xhr.status
    });
};
export default xhr;
