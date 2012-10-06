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

        //TODO this needs work to make it useable for more than 1 use case

        //TODO this is a bit of a hack to accommodate now taking in "true" user object, figure way to make this cleaner
        var screenName = twitterUser.screen_name
        if (screenName == undefined)
            screenName = twitterUser.from_user

        var self = this

        //TODO something is wrong here with DB call, need to figure out and fix this
        SocialMediaAccount.find({username:screenName, ownerId:curUserId}, function (err, dataColl) {

            //only save it if there are no existing entries
            //TODO probably not the most efficient way to check for this, see if an alternative method is meter
            if (dataColl.length <= 3) {
                var rawUser = new SocialMediaAccount();
                rawUser.username = twitterUser.screen_name
                rawUser.userObj = twitterUser
                rawUser.ownerId = curUserId
                rawUser.accountType = "twitter"
                rawUser.isFollowed = false
                //TODO write function to populate other values in SocialMediaAccount with default values (or figure way to do this with schema directly)
                rawUser.save(function () {
                    var userNames = []
                    userNames.push({service:"twitterUsernames",username:twitterUser.screen_name})
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

                    //todo check if there is way to get boolean value if exists, wasteful to get whole object here, we don't need it
                    Person.find({ $where:function () {
                           return  this.twitterUsernames[username]
                      //  return this[service][username]
                    } }, function (err, dataColl) {
                        if (dataColl != undefined && dataColl.length > 0) {
                            person = dataColl[0]
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
            }/*,
             function (innerCallback) {


             innerCallback()

             }*/
        ])

    }
}

Db.clearCollectionMongoose(mongoose.model('SocialMediaAccount'));