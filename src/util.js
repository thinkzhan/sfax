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

export default {

    gid: (function() {
        var id = 0;
        return function() {
            return id++;
        }
    })(),

    merge: function(source, dist) {
        var result = {}

        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                result[key] = source[key]
            }
        }

        for (var key in dist) {
            if (Object.prototype.hasOwnProperty.call(dist, key)) {
                result[key] = dist[key]
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
}
