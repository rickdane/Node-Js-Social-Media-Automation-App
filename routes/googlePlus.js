var fs = require('fs');
var _ = require('underscore');

require('../util/UtilFile.js')
require('../gPlus.js')
require('../Db.js')
require('../webHelper.js')


exports.defaultSearch = function (req, res) {

    var testUserId = "115228087852945642621"

    GPlus.makeApiCall(function (data) {

        var jsonApiResp = JSON.parse(data);

        var jsonResp = {}
        jsonResp.users = new Array()
        jsonResp.users = {
            name:jsonApiResp.name.givenName + " " + jsonApiResp.name.familyName,
            title:jsonApiResp.organizations[0].title

        }

        res.json(jsonResp)

    }, "people/" + testUserId, 'GET')

}