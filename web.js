/*var flatiron = require('flatiron'),
    app = flatiron.app,
    session = require('connect').session,
    cookieParser = require('connect').cookieParser;*/


var express = require('express');
var app = express();


/*
app.get('/', function(req, res){
    res.send('hello world');
});
*/


var _ = require('underscore');


var fs = require('fs');

var Plates = require('plates');
var template = fs.readFileSync("main.html", "utf-8");
var testJs = fs.readFileSync("lib/client.js", "utf-8");
var css = fs.readFileSync("main.css", "utf-8");

var soda = require('soda')


require('./twitter.js')

var util = require('util');



var data = {"main":" Main Title"}


app.get('/version', function (req, res) {

    res.writeHead(200, {"Content-Type":"text/html"})


    res.end(template);

});

app.get('/testBinding', function (req, res) {

    data["main"] = "some fucking thing"

    res.end('flatiron ' + flatiron.version);


});


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

/**
 * Follows a pre-set number of followers from DB queue
 */
app.get('/twitterFollow', function (req, res) {

    var obj = this

    var T = Twitter.initTwit()

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


app.get('/twitter', function (req, res) {
    //adds users to follow queue

    var self = this

    var T = Twitter.initTwit()

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

        /*        //TODO this is complete crap, no separation of concerns, thought about storing data in DB, just for POC purposes, need to figure how to make this cleaner by breaking out to separate functions

         jsonResp[  jsonResp.length ] = twitterUser.screen_name

         if (jsonResp.length >= maxCallbacksIter) {

         var i = 0
         _.each(jsonResp, function (twitterUserScreenName) {

         //hack
         if (i <= maxCallbacksIter) {
         twitterCreateHelper(T, self, twitterUserScreenName)
         }
         i++

         })

         }*/

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


app.post('/twitterSearch', function (req, res) {
    //adds users to follow queue

    var obj = this

    var T = Twitter.initTwit()

    var i = 1

    var reqBody = this.req.body
    var query = reqBody.q

    //number of new users to add to queue
    var maxNumToAdd = 15;

    //only uncomment this to clear collection in DB
    //clearCollectionMongoose(TwitterUserRaw)

    var query = "looking node".

        T.get('users/search', { q:query }, function (err, reply) {
            _.each(dataColl, function (data) {

                if (i <= maxNumToAdd)
                    addToFollowUserToDb(reply)
                else
                    generateJsonOutputUsersToAddQueue(obj)
                i++

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



var testSoda = function (soda, resultsMap) {

    var products = new Array("laptop1", "laptop2");

    for (var i in products) {

        var browser = soda.createClient({
            host:'localhost', port:4444, url:'http://www.google.com', browser:'firefox'
        });

        var chain = browser.chain

        chain.session()
            .open('/')
            .type('q', products[i])
            .click('gbqfsa')
            .getTitle(function (title) {
                resultsMap[i] = title

            })
            .end(function (err) {
                // browser.close()
            });

    }
}


var testTwitter = function (dbClient) {


    var T = initTwit(dbClient)

// Post Tweet
    /*   T.post('statuses/update', { status:'Working on a node js project' }, function (err, reply) {
     var s = ""
     });*/

    //Search for user
    T.get('users/search', { q:'node js' }, function (err, reply) {

        var userName = reply[0].screen_name

        //Follow user
        T.post('friendships/create', { screen_name:userName}, function (err, reply) {
            var s = ""
        });

    });


}

var insertData = function (err, collection) {
    collection.insert({name:"Kristiono Setyadi"});
    collection.insert({name:"Meghan Gill"});
    collection.insert({name:"Spiderman"});
}


function continuous(resultsMap) {

    setTimeout(function () {
        continuous()
    }, 5000)

}


app.listen(7070);