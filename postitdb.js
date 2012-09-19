var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dburl = 'mongodb://localhost/postitnotes';

exports.connect = function (callback)
{
    mongoose.connect(dburl);
};

exports.disconnect = function (callback)
{
    mongoose.disconnect(callback);
};

exports.setup = function(callback)
{
    // dummy implemetation right now, add anything else you want to do during setup
    callback(null);
};
