const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression')

let port = 4000;
let app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('dist'));
app.use(cookieParser());

/* CORS middlewarse */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.header('Origin'));
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, Content-Length, X-Requested-With');
    next();
});

app.options('/get_cross', function (req, res) {
    res.send(200);
});

app.get('/get_cross', function (req, res) {
    console.log(req.cookies)
    setTimeout(function () {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                api: 'get_cross'
            }
        });
    }, 2000)

});

app.options('/post_cross', function (req, res) {
    res.send(200);
});
app.post('/post_cross', function (req, res) {
    res.json({
        code: 200,
        msg: 'ok',
        data: {
            api: 'post_cross'
        }
    });
});


app.listen(port);
