var async = require('async');
var _ = require('underscore');
var fs = require('fs');
require('./twitter.js')

//example of setting up mongoose for mongo db -----------
var mongoose = require('mongoose/');

//TODO change endpoint?
db = mongoose.connect("mongodb://localhost/goaljuice"),
    Schema = mongoose.Schema;

var AssociatedAccounts = new Schema({
    linkedin:String,
    twitter:String,
    meetup:String
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
    associatedAccountsReference:Number,
    ownerId:String
})


//This may not be needed
var RawContactsHolder = new Schema({
    twitter:[SocialMediaAccount],
    linkedin:[SocialMediaAccount],
    meetup:[SocialMediaAccount]

});

mongoose.model('SocialMediaAccount', SocialMediaAccount);
mongoose.model('AssociatedAccounts', AssociatedAccounts);
mongoose.model('RawContactsHolder', RawContactsHolder);
var SocialMediaAccount = mongoose.model('SocialMediaAccount');
var AssociatedAccounts = mongoose.model('AssociatedAccounts');
var RawContactsHolder = mongoose.model('RawContactsHolder');

//this would eventually hold one "rawContacts" object per user of this application
var rawContactsHolder = new RawContactsHolder()
//


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

        //TODO something is wrong here with DB call, need to figure out and fix this
        SocialMediaAccount.find({username:screenName, ownerId:curUserId}, function (err, dataColl) {

            //only save it if there are no existing entries
            //TODO probably not the most efficient way to check for this, see if an alternative method is meter
            if (dataColl.length <= 0) {
                var rawUser = new SocialMediaAccount();
                rawUser.username = twitterUser.screen_name
                rawUser.userObj = twitterUser
                rawUser.ownerId = curUserId
                rawUser.accountType = "twitter"
                rawUser.isFollowed = false
                //TODO write function to populate other values in SocialMediaAccount with default values (or figure way to do this with schema directly)
                rawUser.save(function () {

                });
            }
        })

    }
}

//Db.clearCollectionMongoose(mongoose.model('SocialMediaAccount'));