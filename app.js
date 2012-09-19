var flatiron = require('flatiron'),
    path = require('path'),
    app = flatiron.app;


app.config.file({ file:path.join(__dirname, 'config', 'config.json') });

app.use(flatiron.plugins.http);

app.router.get('/', function () {
    var Browser = require("zombie");

    traverseTree(Browser, "http://walmart.com")
    this.res.json({ 'hello':'world' })

});

app.start(3000);


var traverseTree = function (Browser, url) {






    /*    browser = new Browser()
     browser.visit(url, function () {
     var sys = require('sys');

     */
    /*       browser.document.getElementsByName()["search_query"]
     var searchBox = document.getElementById("item-23");
     searchBox.set*/
    /*

     sys.puts(browser.html())


     browser.fill("searchText", "sony laptop").pressButton("search_btn", function () {


     })
     });*/

}


