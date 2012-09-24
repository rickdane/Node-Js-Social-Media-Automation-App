var express = require('express');
var app = express();
var passport = require("passport")
var async = require('async');
LocalStrategy = require("passport-local").Strategy
var _ = require('underscore');
var fs = require('fs');
var testJs = fs.readFileSync("lib/client.js", "utf-8");
var css = fs.readFileSync("main.css", "utf-8");

require('./twitter.js')
require('./Db.js')
require('./webHelper.js')

//for processing of http input parameters, etc
app.use(express.bodyParser());


//this is empty, for now, but would contain user id's that we don't want to follow, for whatever reason (id'd as spam, etc)
var followIgnoreList = new Array()


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


/**
 * Follows a pre-set number of followers from DB queue
 */
app.get('/twitterFollow', function (req, res) {

    Twitter.twitterRunCallback(WebHelper.getUserName(), function (T) {
        var jsonResponse = new Array()

        Db.getTwitterUserRaw().find({isFollowed:"false"}, function (err, dataColl) {

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


WebHelper.loadFollowedOfCurUser()


app.get('/twitterQueue', function (req, res) {
    //adds users to follow queue

    var self = this

    Twitter.twitterRunCallback(WebHelper.getUserName(), function (T) {
        var jsonResp = new Array();

        //just for testing, random username
        var startUserName = "mollycaudle"

        var maxCallbacksIter = 7

        //only uncomment this to clear collection in DB
        //clearCollectionMongoose(TwitterUserRaw)

        var i = 0
        //NOTE: this is actually just adding users to DB, not following, that is done in a different endpoint function
        Twitter.followFollowersOfUser(T, startUserName, new Array(), maxCallbacksIter, function (twitterUser) {

            var jsonResp = new Array();

            if (i < maxCallbacksIter) {

                Db.getTwitterUserRaw().find({screenName:twitterUser.screen_name}, function (err, dataColl) {

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
                Db.getTwitterUserRaw().find({isFollowed:"false"}, function (err, dataColl) {

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


app.post('/tweetSearchForUsers', function (req, res) {

    var self = this

    req.body.geocode = WebHelper.getGeoCode()

    Twitter.twitterRunCallback(WebHelper.getUserName(), function (T) {

        var i = 1

        //number of new users to add to queue
        var maxNumToAdd = 15;


        T.get('search', WebHelper.facetedSearchBuilder(req.body), function (err, dataColl) {
            _.each(dataColl.results, function (data) {

                if (curFollowedCurUser.indexOf(data.from_user_id) < 0 && followIgnoreList.indexOf(data.from_user_id) < 0) {
                    //user hasn't been followed yet and is not in ignore list so we can add to follow queue

                    //TODO see if there is there a way to make the code block below into one liner
                    if (i <= maxNumToAdd)
                        Db.addToFollowUserToDb(data)
                    else
                        WebHelper.generateJsonOutputUsersToAddQueue(self)
                    i++

                }
            })
        })
    })
});

/**
 * Adds users to follow queue
 */
app.post('/twitterSearch', function (req, res) {

    var self = this

    Twitter.twitterRunCallback(userName, function (T) {

        var i = 1

        //number of new users to add to queue
        var maxNumToAdd = 15;


        T.get('users/search', WebHelper.facetedSearchBuilder(req.body), function (err, dataColl) {
            _.each(dataColl, function (data) {

                if (i <= maxNumToAdd)
                    Db.addToFollowUserToDb(data)
                else
                    WebHelper.generateJsonOutputUsersToAddQueue(self)
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