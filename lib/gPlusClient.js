var GPlus = {
    Models: {},
    Collections: {},
    Views: {},
    Templates:{}
}

GPlus.Models.Movie = Backbone.Model.extend({})
GPlus.Collections.Movies = Backbone.Collection.extend({
    model: GPlus.Models.Movie,
    url: "/twitter",
    initialize: function(){
    }
});

GPlus.Templates.movies = _.template($("#tmplt-Movies").html())

GPlus.Views.Movies = Backbone.View.extend({
    el: $("#mainContainer"),
    template: GPlus.Templates.movies,
    //collection: new GPlus.Collections.Movies(), //Not needed

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
        view = new GPlus.Views.Movie({ model: model });
        $("ul", this.el).append(view.render());
        //this is what triggers the synch with the server
        model.save()
    }

})


GPlus.Templates.movie = _.template($("#tmplt-Movie").html())
GPlus.Views.Movie = Backbone.View.extend({
    tagName: "li",
    template: GPlus.Templates.movie,
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


GPlus.Router = Backbone.Router.extend({
    routes: {
        "": "defaultRoute"  //http://localhost:22257/GPlus/GPlus.htm
    },

    defaultRoute: function () {
        GPlus.movies = new GPlus.Collections.Movies()
        new GPlus.Views.Movies({ collection: GPlus.movies }); //Add this line
        GPlus.movies.fetch();
    }
})

var appRouter = new GPlus.Router();
Backbone.history.start();

//This is a hack for demonstration  purposes
$("#butAddItem").click(null, function () {
    var movie = new GPlus.Models.Movie(
        {
            "Id":"BVP3s",
            "Name":"Lord of the Rings: The Return of the King: Extended Edition: Bonus Material",
            "AverageRating":4.3,
            "ReleaseYear":2003,
            "Url":"http://www.netflix.com/Movie/Lord_of_the_Rings_The_Return_of_the_King_Extended_Edition_Bonus_Material/70024204",
            "Rating":"PG-13"
        }
    )

    GPlus.movies.add(movie);
})

