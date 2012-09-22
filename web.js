var express = require('express');
var app = express();
var passport = require("passport")
var async = require('async');
LocalStrategy = require("passport-local").Strategy
var _ = require('underscore');
var fs = require('fs');
var testJs = fs.readFileSync("lib/client.js", "utf-8");
var css = fs.readFileSync("main.css", "utf-8");

//for processing of http input parameters, etc
app.use(express.bodyParser());

require('./twitter.js')

var util = require('util');


var data = {"main":" Main Title"}


app.get('/loadCss', function (req, res) {

    res.end(css);


});

app.get('/loadJs', function (req, res) {

    res.end(testJs);


});


app.get('/entities', function (req, res) {

    var jsonResp = {
        id:1,
        name:'my name'
    }

    res.json(jsonResp);
    res.end()

});


//example of setting up mongoose for mongo db -----------
var mongoose = require('mongoose/');
db = mongoose.connect("mongodb://localhost/goaljuice"),
    Schema = mongoose.Schema;

// Create a schema for our data
var TwitterUserRawSchema = new Schema({
    screenName:String,
    userObj:Object,
    isFollowed:String
});
// Example: Use the schema to register a model with MongoDb
//mongoose.model('TwitterUsersRaw', MessageSchema);

mongoose.model('TwitterUserRaw', TwitterUserRawSchema);
var TwitterUserRaw = mongoose.model('TwitterUserRaw');


var twitterFollowHelper = function (T, obj, twitterUserScreenName) {
    T.post('friendships/create', { screen_name:twitterUserScreenName }, function (err, reply) {

        obj.res.json(twitterUserScreenName);
        obj.res.end()
    })
}

var clearCollectionMongoose = function (Collection) {
    Collection.find({}, function (err, dataColl) {
        _.each(dataColl, function (model) {
            model.remove()
        })
    })
}

//just for test purposes, this wouldn't normally be hard-coded
var userName = "devr_5"


/**
 * Follows a pre-set number of followers from DB queue
 */
app.get('/twitterFollow', function (req, res) {

    Twitter.twitterRunCallback(userName, function (T) {
        var jsonResponse = new Array()

        TwitterUserRaw.find({isFollowed:"false"}, function (err, dataColl) {

            var numToFollow = 5

            var i = 0
            _.each(dataColl, function (data) {

                if (i <= 5) {
                    data.isFollowed = "true"
                    data.save(function () {
                    });

                    T.post('friendships/create', { screen_name:data.screenName }, function (err, reply) {

                    })

                    jsonResponse[i] = data.screenName
                }
                i++
            })

            //show all current usernames currently in DB to user
            //TODO this should eventually show all that have not been followed, another follower endpoint will actually do following
            res.json(jsonResponse);
            res.end()
        })
    })


})


app.get('/twitterQueue', function (req, res) {
    //adds users to follow queue

    var self = this

    Twitter.twitterRunCallback(userName, function (T) {
        var jsonResp = new Array();

        var startUserName = "mollycaudle"

        var maxCallbacksIter = 7

        //only uncomment this to clear collection in DB
        //clearCollectionMongoose(TwitterUserRaw)

        var i = 0
        //NOTE: this is actually just adding users to DB, not following, that is done in a different endpoint function
        Twitter.followFollowersOfUser(T, startUserName, new Array(), maxCallbacksIter, function (twitterUser) {

            var jsonResp = new Array();

            if (i < maxCallbacksIter) {

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
            else {
                TwitterUserRaw.find({isFollowed:"false"}, function (err, dataColl) {

                    var i = 0
                    _.each(dataColl, function (data) {
                        jsonResp[i] = data.screenName
                        i++
                    })

                    //show all current usernames currently in DB to user
                    //TODO this should eventually show all that have not been followed, another follower endpoint will actually do following
                    res.json(jsonResp);
                    res.end()
                })
            }
            i++

        })


    })


});

var addToFollowUserToDb = function (twitterUser) {

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

var generateJsonOutputUsersToAddQueue = function (obj) {

    var jsonResp = new Array();

    //todo break this out into function as other endpoints want to use this as well
    TwitterUserRaw.find({isFollowed:"false"}, function (err, dataColl) {

        var i = 0
        _.each(dataColl, function (data) {
            jsonResp[i] = data.screenName
            i++
        })

        //show all current usernames currently in DB to user
        //TODO this should eventually show all that have not been followed, another follower endpoint will actually do following
        obj.res.json(jsonResp);
        obj.res.end()
    })

}

/**
 * Adds users to follow queue
 */

app.post('/twitterSearch', function (req, res) {

    var self = this

    var query = req.body.q

    Twitter.twitterRunCallback(userName, function (T) {

        var i = 1

        //number of new users to add to queue
        var maxNumToAdd = 15;


        T.get('users/search', { q:query }, function (err, dataColl) {
            _.each(dataColl, function (data) {

                if (i <= maxNumToAdd)
                    addToFollowUserToDb(data)
                else
                    generateJsonOutputUsersToAddQueue(self)
                i++

            })
        })

    })


});


app.post('/twitter', function (req, res) {

    var reqBody = this.req.body
    this.res.json({
        id:1,
        name:'my name'
    });

});

app.put('/twitter', function (req, res) {

    var reqBody = this.req.body
    this.res.json({
        id:1,
        name:'my name'
    });

});


app.listen(7070);