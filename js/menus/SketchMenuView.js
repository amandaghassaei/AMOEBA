/**
 * Created by aghassaei on 1/26/15.
 */


SketchMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render");
//        this.listenTo(this.model, "change", function(){
//            if (options.appState.get("currentTab")!="sketch") return;
//            this.render();
//        });
    },

    render: function(){
        this.$el.html(this.template());
        this.model.set("cellMode", "cell");
    },

    template: _.template('\
        sketch and extrude commands\
        ')

});