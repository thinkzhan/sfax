import util from '../util'

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
        if (notGet) {
            xdr.send(paramData);
        } else {
            xdr.send();
        }
    })
}
xdr.prototype.create = function () {
    return new XDomainRequest()
}
xdr.prototype._handleError = function (reason, reject) {
    return reject({
        reason: reason,
        status: this.xdr.status
    });
};
export default xdr;
