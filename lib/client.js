var Theater = {
    Models: {},
    Collections: {},
    Views: {},
    Templates:{}
}

Theater.Models.Movie = Backbone.Model.extend({})
Theater.Collections.Movies = Backbone.Collection.extend({
    model: Theater.Models.Movie,
    url: "/twitter",
    initialize: function(){
    }
});

Theater.Templates.movies = _.template($("#tmplt-Movies").html())

Theater.Views.Movies = Backbone.View.extend({
    el: $("#mainContainer"),
    template: Theater.Templates.movies,
    //collection: new Theater.Collections.Movies(), //Not needed

    initialize: function () {
        //_.bindAll(this, "render", "addOne", "addAll");
        this.collection.bind("reset", this.render, this);
        this.collection.bind("add", this.addOne, this);
    },

    render: function () {
        $(this.el).html(this.template());
        this.addAll();
    },

    addAll: function () {
        this.collection.each(this.addOne);
    },

    addOne: function (model) {
        view = new Theater.Views.Movie({ model: model });
        $("ul", this.el).append(view.render());
        //this is what triggers the synch with the server
        model.save()
    }

})


Theater.Templates.movie = _.template($("#tmplt-Movie").html())
Theater.Views.Movie = Backbone.View.extend({
    tagName: "li",
    template: Theater.Templates.movie,
    //events: { "click .delete": "test" },

    initialize: function () {
        //_.bindAll(this, 'render', 'test');
        this.model.bind('destroy', this.destroyItem, this);
        this.model.bind('remove', this.removeItem, this);
    },

    render: function () {
        return $(this.el).append(this.template(this.model.toJSON())) ;
    },

    removeItem: function (model) {
        this.remove();
    }
})


Theater.Router = Backbone.Router.extend({
    routes: {
        "": "defaultRoute"  //http://localhost:22257/Theater/theater.htm
    },

    defaultRoute: function () {
        Theater.movies = new Theater.Collections.Movies()
        new Theater.Views.Movies({ collection: Theater.movies }); //Add this line
        Theater.movies.fetch();
    }
})

var appRouter = new Theater.Router();
Backbone.history.start();

//This is a hack for demonstration  purposes
$("#butAddItem").click(null, function () {
    var movie = new Theater.Models.Movie(
        {
            "Id":"BVP3s",
            "Name":"Lord of the Rings: The Return of the King: Extended Edition: Bonus Material",
            "AverageRating":4.3,
            "ReleaseYear":2003,
            "Url":"http://www.netflix.com/Movie/Lord_of_the_Rings_The_Return_of_the_King_Extended_Edition_Bonus_Material/70024204",
            "Rating":"PG-13"
        }
    )

    Theater.movies.add(movie);
})

