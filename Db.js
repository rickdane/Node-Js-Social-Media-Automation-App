var async = require('async');
var _ = require('underscore');
var fs = require('fs');
require('./twitter.js')

//example of setting up mongoose for mongo db -----------
var mongoose = require('mongoose/');

//TODO change endpoint?
db = mongoose.connect("mongodb://localhost/goaljuice"),
    Schema = mongoose.Schema;

/**
 * This is meant only for associating two accounts that are owned by the same user
 * @type {Schema}
 */

var Person = new Schema({
    firstName:String,
    lastName:String,
    city:String,
    state:String,
    email:String,
    twitterUsernames:[String],
    linkedinUsernames:[String],
    meetupUsernames:[String]
})

var SocialMediaAccount = new Schema({
    username:String,
    lastToMessageDate:String,
    lastFromMessageDate:String,
    followsMe:Boolean,
    dateFollowed:String,
    isFollowed:Boolean,
    dateCreated:String,
    ignore:Boolean,
    accountType:String,
    userObj:Object,
    ownerId:String
})


mongoose.model('SocialMediaAccount', SocialMediaAccount);
mongoose.model('Person', Person);
var SocialMediaAccount = mongoose.model('SocialMediaAccount');
var Person = mongoose.model('Person');


Db = {
    getSocialMediaAccount:function () {
        return  SocialMediaAccount
    },
    clearCollectionMongoose:function (Collection) {
        Collection.find({}, function (err, dataColl) {
            _.each(dataColl, function (model) {
                model.remove()
            })
        })
    },
    addTwitterUserToFollowUserToDb:function (twitterUser, curUserId) {

        var screenName = twitterUser.screen_name
        if (screenName == undefined)
            screenName = twitterUser.from_user

        var self = this

        SocialMediaAccount.count({username:screenName, ownerId:curUserId}, function (err, c) {

            //only save it if there are no existing entries
            if (c <= 1) {
                var rawUser = new SocialMediaAccount();
                rawUser.username = twitterUser.screen_name
                rawUser.userObj = twitterUser
                rawUser.ownerId = curUserId
                rawUser.accountType = "twitter"
                rawUser.isFollowed = false
                //TODO write function to populate other values in SocialMediaAccount with default values (or figure way to do this with schema directly)
                rawUser.save(function () {
                    var userNames = []
                    userNames.push({service:"twitterUsernames", username:twitterUser.screen_name})
                    self.createPersonHelper(userNames)
                });
            }
        })

    },
    /**
     * This is still in progress, idea is that it can take 1 or more sets of usernames, from diff or same service, determine if person obj exists for those services, if not, it creates a new one
     * @param userNames
     */
    createPersonHelper:function (userNames) {

        var person
        var userNamesToAdd = new Array()


        async.series([
            function (innerCallback) {

                _.each(userNames, function (userNameObj) {

                    var service = userNameObj.service
                    var username = userNameObj.username

                    //todo change this to use findOne instead of find method
                    //finds where the array contains, since it may have more than one username per person

                    var query = {};
                    query[service] = username;

                    Person.findOne(query, function (err, data) {
                        if (data != undefined) {
                            person = data
                        }
                        else {
                            userNamesToAdd.push(userNameObj)
                        }
                        innerCallback()
                    })

                })
            },
            function (innerCallback) {
                if (person == undefined) {
                    //the person doesn't exist for any of the accounts, need to create it
                    person = new Person()
                }

                _.each(userNamesToAdd, function (userNameObj) {
                    var service = userNameObj.service
                    var username = userNameObj.username

                    person[service] = [username]

                })

                person.save(function () {

                })
                innerCallback();
            }
        ])

    }
}

Db.clearCollectionMongoose(mongoose.model('SocialMediaAccount'));