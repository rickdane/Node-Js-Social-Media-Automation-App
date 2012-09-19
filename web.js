var flatiron = require('flatiron'),
    app = flatiron.app;

var _ = require('underscore');

//var jquery = require('js/jquery-1.7.2.js')

var fs = require('fs');

var Plates = require('plates');
var template = fs.readFileSync("main.html", "utf-8");
var testJs = fs.readFileSync("lib/client.js", "utf-8");
var css = fs.readFileSync("main.css", "utf-8");

var soda = require('soda')


require('./twitter.js')

var util = require('util');


app.use(flatiron.plugins.http, {
    // HTTP options
});


var data = {"main":" Main Title"}


app.router.get('/version', function () {

    this.res.writeHead(200, {"Content-Type":"text/html"})


    this.res.end(template);

});

app.router.get('/testBinding', function () {

    data["main"] = "some fucking thing"

    this.res.end('flatiron ' + flatiron.version);


});


app.router.get('/loadCss', function () {

    this.res.end(css);


});

app.router.get('/loadJs', function () {

    this.res.end(testJs);


});


app.router.get('/entities', function () {

    var jsonResp = {
        id:1,
        name:'my name'
    }

    this.res.json(jsonResp);
    this.res.end()

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
app.router.get('/twitterFollow', function () {

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
        obj.res.json(jsonResponse);
        obj.res.end()
    })

})


app.router.get('/twitter', function () {
    //adds users to follow queue

    var obj = this

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
                obj.res.json(jsonResp);
                obj.res.end()
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
         twitterCreateHelper(T, obj, twitterUserScreenName)
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


app.router.post('/twitterSearch', function () {
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


app.router.post('/twitter', function () {

    var reqBody = this.req.body
    this.res.json({
        id:1,
        name:'my name'
    });

});

app.router.put('/twitter', function () {

    var reqBody = this.req.body
    this.res.json({
        id:1,
        name:'my name'
    });

});


// This router syntax allows you to define multiple handlers for one path based
// on http method.
app.router.path('/', function () {

    // This is the same functionality as previously.
    this.get(function () {
        this.res.writeHead(200, { 'content-type':'text/plain' });
        this.res.end('hello!');
    });

    // Now, when you post a body to the server, it will reply with a JSON
    // representation of the same body.
    this.post(function () {
        this.res.json(200, this.req.body);
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


app.start(7070);