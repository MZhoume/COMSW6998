/// <reference path="../typings/index.d.ts" />
"use strict";
var express = require('express');
var app = express();
app.use(express.static('www'));
app.get('/hello', function (req, res) {
    res.send('World!');
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
