var async = require('async');
var _ = require('underscore');
var fs = require('fs');
require('./twitter.js')

twitterSearchParams : new Array('q', 'geocode')

//just for test purposes, this wouldn't normally be hard-coded
var userName = "devr_5"

curFollowedCurUser = new Array()

WebHelper = {


// Example: Use the schema to register a model with MongoDb
//mongoose.model('TwitterUsersRaw', MessageSchema);
    getUserName:function () {
        return userName
    },
    twitterFollowHelper:function (T, obj, twitterUserScreenName) {
        T.post('friendships/create', { screen_name:twitterUserScreenName }, function (err, reply) {

            obj.res.json(twitterUserScreenName);
            obj.res.end()
        })
    },
    loadFollowedOfCurUser:function () {
        Twitter.twitterRunCallback(userName, function (T) {
            T.get('friends/ids', {}, function (err, dataColl) {
                _.each(dataColl.ids, function (data) {

                    curFollowedCurUser.push(data)

                })
            })
        })
    },
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

    }

}