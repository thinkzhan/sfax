function jsonp(options) {
    this.options = options;
    this.jsonp = this.create();
}
jsonp.prototype.send = function () {
    var _this = this,
        _jsonp = this.jsonp,
        options = this.options;

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
}
export default jsonp;
