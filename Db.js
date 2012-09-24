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

        //TODO this needs work to make it useable for more than 1 use case

        //TODO this is a bit of a hack to accommodate now taking in "true" user object, figure way to make this cleaner
        var screenName = twitterUser.screen_name
        if (screenName == undefined)
            screenName = twitterUser.from_user

        //TODO something is wrong here with DB call, need to figure out and fix this
        TwitterUserRaw.find({screenName:screenName}, function (err, dataColl) {

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