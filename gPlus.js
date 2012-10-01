var _ = require('underscore')
var fs = require('fs')
var async = require('async');
var https = require('https');
var http = require('http');
require('./util/UtilFile.js')

var apiUrl = "www.googleapis.com"
var gPlusEndpoint = "/plus/v1/"

//todo move this to util file
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

var httpOptions = {
    host:apiUrl,
    path:'',
    port:"443",
    method:''
    /*,
     headers:{
     'Content-Type':'application/json'
     }*/
};

var properties = {}

GPlus = {


    init:function () {

        var T

        async.series([
            function (innerCallback) {

                UtilFile.readPropertiesToMap("authentication_gplus.txt", properties, innerCallback)

            }])

    },
    search:function () {

    },
    makeApiCall:function (callback, endpoint, method) {
        var options = clone(httpOptions)
        options.method = method

        //todo this is just hack to get this working, re-work this to be cleaner
        options.path = gPlusEndpoint + endpoint + "?key=" + properties["access_key"]

        https.get(options, function (res) {

            var pageData = "";
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                pageData += chunk;
            });

            res.on('end', function () {
                callback(pageData)
            });
        })
    }
}

GPlus.init()