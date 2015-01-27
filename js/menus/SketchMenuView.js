/**
 * Created by aghassaei on 1/26/15.
 */


SketchMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    currentlySelected: false,

    initialize: function(){

        _.bindAll(this, "render");
//        this.listenTo(this.model, "change", function(){
//            if (!this.currentlySelected) return;
//            this.render();
//        });
    },

    render: function(){
        this.currentlySelected = true;
        this.$el.html(this.template());
        this.model.set("cellMode", "cell");
    },

    template: _.template('\
        sketch and extrude commands\
        ')

});