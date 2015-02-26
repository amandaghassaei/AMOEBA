/**
 * Created by aghassaei on 2/25/15.
 */

PhysicsMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.get("currentTab") != "physics") return;
        this.$el.html(this.template());
    },

    template: _.template('\
        world physics: gravity, global forces\
        <br/><br/>\
        part connection stiffness\
        <br/><br/>\
        ground/fixed/boundary conditions definition\
        ')

});