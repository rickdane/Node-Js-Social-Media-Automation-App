var async = require('async');
var _ = require('underscore');
var fs = require('fs');
require('./twitter.js')
require('./Db.js')

var twitterSearchParams = new Array('q', 'geocode')

curFollowedCurUser = new Array()

WebHelper = {


// Example: Use the schema to register a model with MongoDb
//mongoose.model('TwitterUsersRaw', MessageSchema);

    twitterFollowHelper:function (T, obj, twitterUserScreenName) {
        T.post('friendships/create', { screen_name:twitterUserScreenName }, function (err, reply) {

            obj.res.json(twitterUserScreenName);
            obj.res.end()
        })
    },
/*    loadFollowedOfCurUser:function (T) {
        Twitter.twitterRunCallback(function (T) {
            T.get('friends/ids', {}, function (err, dataColl) {
                _.each(dataColl.ids, function (data) {

                    curFollowedCurUser.push(data)

                })
            })
        })
    },*/
    /**
     * for building faceted query, the incoming post query may contain extra parameters that aren't relevant to twitter api call so this prepares a new object for the twitter api call
     */
    facetedSearchBuilder:function (queryObj) {
        var searchObj = {}

        for (prop in queryObj) {
            if (twitterSearchParams.indexOf(prop) > -1) {
                searchObj[prop] = queryObj[prop]
            }
        }
        return searchObj

    },
    generateJsonOutputUsersToAddQueue:function (res) {

        var jsonResp = new Array();

        //todo break this out into function as other endpoints want to use this as well
        Db.getTwitterUserRaw().find({isFollowed:"false"}, function (err, dataColl) {

            var i = 0
            _.each(dataColl, function (data) {
                jsonResp[i] = data.screenName
                i++
            })

            //show all current usernames currently in DB to user
            //TODO this should eventually show all that have not been followed, another follower endpoint will actually do following
         //   res.render('users', { title: 'Users', users: jsonResp });

            res.json(jsonResp);
            res.end()
            return;
        })

    },
    getGeoCode:function (location) {
        //this is just for test purposes, this would need to be expanded out to actually give the geolocation based on user's input
        //todo should enable user to pass in city / state to obtain this automatically, for now just hard-coded for testing
        var milesFromGeoLocation = "70mi"
        var geoCode = "37.779333,-122.393163," + milesFromGeoLocation   //this is within San Francisco, CA
        return geoCode
    }

}