var _ = require('underscore')
var fs = require('fs')
var async = require('async');
require('./util/UtilFile.js')

Twitter = {

    initTwit:function (callback) {

        var Twit = require('twit')

        var twitterProperties = {}

        var T

        async.series([
            function (innerCallback) {

                UtilFile.readPropertiesToMap("twitter_authentication.txt", twitterProperties, innerCallback)

            },
            function (innerCallback) {
                T = new Twit({
                    consumer_key:twitterProperties["consumer_key"],
                    consumer_secret:twitterProperties["consumer_secret"],
                    access_token:twitterProperties["access_token"],
                    access_token_secret:twitterProperties["access_token_secret"]
                })
                innerCallback();
            },
            function (innerCallback) {
                callback(T)
                innerCallback()
            }
        ])

    },
    getFirstUserForSearch:function (T, callback) {
        //this is just example, probably not useful for anything

        T.get('users/search', { q:'node js' }, function (err, reply) {

            var jsonResp = [
                {
                    "Id":reply[0].screen_name
                },
                {
                    "Id":reply[1].screen_name
                }
            ]

            callback(jsonResp)

        })

    },
    followFollowersOfUser:function (T, userScreenName, ignoreArr, maxCallbacksIter, callback) {


        T.get('followers/ids', { screen_name:userScreenName }, function (err, reply) {
            var userQueryStr = ""
            var i = 0
            _.each(reply.ids, function (userId) {

                //TODO idea here will be to ignore a user if its in an ignore list (could be already following, id's as spam, etc, etc..., this function doesn't care why)
                //  if (ignoreArr.indexOf(reply[num].screen_name) < 0)

                if (i <= maxCallbacksIter)
                    userQueryStr = userId + "," + userQueryStr

                i++;

            })

            userQueryStr = userQueryStr.slice(0, userQueryStr.length - 1);

            T.get('users/lookup', { user_id:userQueryStr }, function (err, reply) {
                _.each(reply, function (twitterUser) {
                    callback(twitterUser)
                })
            })
        })
    }

};


