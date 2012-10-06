var express = require('express'),
    app = express(),
    site = require('./routes/site') ,
    twitter = require('./routes/twitter'),
    gPlus = require('./routes/googlePlus')

// Config

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

//for processing of http input parameters, etc
app.use(express.bodyParser())
app.use(express.methodOverride());
/*app.use(express.cookieParser());
 app.use(express.methodOverride());*/
app.use("/public", express.static(__dirname + '/public'));
app.use("/lib", express.static(__dirname + '/lib'));
//app.use(express.static(__dirname + '/public'));


// Home Page
app.get('/', site.index)


//Twitter
//TODO refactor paths, they could be done better
app.get('/twitterFollow', twitter.twitterFollow)
app.get('/twitterQueue', twitter.twitterQueue)
app.get('/tweetSearchForUsers', twitter.tweetSearchForUsers)
app.get('/twitterSearch', twitter.twitterSearch)
app.get('/twitter', twitter.twitter)


//GPlus
app.get('/loadGplusApp', gPlus.loadGplusApp)
app.get('/defaultSearch', gPlus.defaultSearch)


app.listen(7070)
