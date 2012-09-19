var _ = require('underscore')

Twitter = {

    initTwit:function () {

        var Twit = require('twit')

        var T = new Twit({
            consumer_key:'xgOspPOxjmisSLgM4ulZHA',
            consumer_secret:'GmEU0QwcONTv5jXJCAbtIWhGaLU0oW8Y3mlmgUJDcI',
            access_token:'771240152-wkjx4r0QWxPQDk91vIadp28QYPuxkwEmw60DBXSk',
            access_token_secret:'HMo9FPL7lWfudyWSiNK7VNDp7Spvd0PvY0tF3H8frk'
        })

        return T
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


