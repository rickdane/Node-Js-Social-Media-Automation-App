var async = require('async');
var _ = require('underscore');
var fs = require('fs');
require('./twitter.js')

//example of setting up mongoose for mongo db -----------
var mongoose = require('mongoose/');

//TODO change endpoint?
db = mongoose.connect("mongodb://localhost/goaljuice"),
    Schema = mongoose.Schema;

// Create a schema for our data
var TwitterUserRawSchema = new Schema({
    screenName:String,
    userObj:Object,
    isFollowed:String
});

mongoose.model('TwitterUserRaw', TwitterUserRawSchema);
var TwitterUserRaw = mongoose.model('TwitterUserRaw');

Db = {
    getTwitterUserRaw:function () {
        return  TwitterUserRaw
    },
    clearCollectionMongoose:function (Collection) {
        Collection.find({}, function (err, dataColl) {
            _.each(dataColl, function (model) {
                model.remove()
            })
        })
    },
    addToFollowUserToDb:function (twitterUser) {

        TwitterUserRaw.find({screenName:twitterUser.screen_name}, function (err, dataColl) {

            //only save it if there are no existing entries
            //TODO probably not the most efficient way to check for this, see if an alternative method is meter
            if (dataColl.length <= 0) {
                var rawUser = new TwitterUserRaw();
                rawUser.screenName = twitterUser.screen_name
                rawUser.userObj = twitterUser
                rawUser.isFollowed = "false"
                rawUser.save(function () {

                });
            }
        })

    }
}