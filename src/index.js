import util from './util'
import xhr from './lib/xhr'
import xdr from './lib/xdr'
import iframe from './lib/iframe'
import jsonp from './lib/jsonp'

function sfax(options) {
    var dftOptions = {
        type: 'get',
        withCredentials: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: {},
        jsonp: false
    }

    options = util.merge(dftOptions, options)

    if (!/^(http|\/[^\/]|\/\/)/.test(options.url)) {
        options.url = sfax.baseUrl + '/' + options.url
    }
    if (/^\/[^\/]/.test(options.url)) {
        options.url = location.protocol + '//' + location.host + options.url
    } else if (/^\/\//.test(options.url)) {
        options.url = location.protocol + options.url
    }

    if (options.jsonp) {
        return new jsonp(options).send()
    }
    if (util.isLowerIe9()) {
        if (util.isCrossDomain(options.url)) {
            if (options.withCredentials) {
                // console.log('need iframe');
                return new iframe(options).send()
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

export default sfax
