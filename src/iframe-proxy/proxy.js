import xhr from '../lib/xhr'
import util from '../util'

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

}, window)
