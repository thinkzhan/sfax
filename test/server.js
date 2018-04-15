const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

let port = 3000;
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('test'));
app.use(cookieParser());

app.get('/get', function (req, res) {
    setTimeout(function () {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                api: 'get'
            }
        });
    }, 2000)

});

app.post('/post', function (req, res) {
    res.json({
        code: 200,
        msg: 'ok',
        data: {
            api: 'post'
        }
    });
});

app.get('/getJsonp', function (req, res) {
    res.jsonp({
        code: 200,
        msg: 'ok',
        data: {
            api: 'getJsonp'
        }
    });
});


app.listen(port);
