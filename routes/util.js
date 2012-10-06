var fs = require('fs');
var css = fs.readFileSync("main.css", "utf-8");
var testJs = fs.readFileSync("lib/gPlusClient.js", "utf-8");

exports.loadCss = function (req, res) {

    res.end(css);


}

exports.loadJs = function (req, res) {

    res.end(testJs);


}