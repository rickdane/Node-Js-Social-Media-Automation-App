var GPlus = {
    Models:{},
    Collections:{},
    Views:{},
    Templates:{}
}


GPlus.Models.User = Backbone.Model.extend({})

GPlus.Collections.Users = Backbone.Collection.extend({
    model:GPlus.Models.User,
    url:"/defaultSearch",
    initialize:function () {

    }
});


GPlus.Templates.Users = _.template($("#tmplt-Users").html())

GPlus.Views.Users = Backbone.View.extend({
    el:$("#mainContainer"),
    template:GPlus.Templates.Users,

    initialize:function () {

        /*   var options = {};
         ptions.success = this.render;
         users.fetch({});*/


        // _.bindAll(this, "render", "addOne", "addAll");
        this.collection.bind("reset", this.render, this);
        this.collection.bind("add", this.addOne, this);
    },

    render:function () {

        $(this.el).html(this.template());
        this.addAll();
    },

    addAll:function () {
        this.collection.each(this.addOne);
    },

    addOne:function (model) {
        view = new GPlus.Views.User({ model:model });
        $("ul", this.el).append(view.render());
        //this is what triggers the synch with the server
        model.save()
    }

})


GPlus.Templates.User = _.template($("#tmplt-User").html())

GPlus.Views.User = Backbone.View.extend({
    tagName:"li",
    template:GPlus.Templates.User,
    //events: { "click .delete": "test" },

    initialize:function () {
        // _.bindAll(this, 'render', 'test');
        this.model.bind('destroy', this.destroyItem, this);
        this.model.bind('remove', this.removeItem, this);
    },

    render:function () {
        //todo shouldn't be collection at this point, shouldn't need .users
        return $(this.el).append(this.template(this.model.toJSON().users));
    },

    removeItem:function (model) {
        this.remove();
    }
})


GPlus.Router = Backbone.Router.extend({
    routes:{
        "":"defaultSearch"
    },

    defaultRoute:function () {
        GPlus.Users = new GPlus.Collections.Users()
        new GPlus.Views.Users({ collection:GPlus.Users });
        GPlus.Users.fetch();
    }
})

var appRouter = new GPlus.Router();
appRouter.defaultRoute()

Backbone.history.start();


$("#butAddItem").click(null, function () {

    /*    var Users = ''

     GPlus.Users.addAll(Users);*/

})

