/// <reference path="../typings/index.d.ts" />

import * as express from 'express';

var app = express();

app.use(express.static('www'));

app.get('/hello', (req, res) => {
    res.send('World!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});