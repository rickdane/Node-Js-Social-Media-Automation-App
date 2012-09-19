var util = require('util');
var async = require('async');
var postitdb = require('./postitdb');

postitdb.connect(function(error)
{
    if (error) throw error;
});

postitdb.setup(function(error)
{
    if (error)
    {
        util.log('ERROR ' + error);
        throw error;
    }
    async.series([
        function(cb)
        {
            postitdb.add("2012",
                "Plans for summer 2012 concerts! Make some noise!",
                function(error)
                {
                    if (error) util.log('ERROR '+ error);
                    cb(error);
                });
        }
    ],
        function(error, results)
        {
            if (error) util.log('ERROR ' + error);
            postitdb.disconnect(function(err) {} );
        }
    );
});