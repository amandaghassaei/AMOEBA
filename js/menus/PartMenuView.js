/**
 * Created by aghassaei on 1/26/15.
 */

PartMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render");
        this.listenTo(this.model, "change:partType", this.render);
//        this.listenTo(this.model, "change", function(){
//            if (options.appState.get("currentTab")!="part") return;
//            this.render();
//        });
    },

    render: function(){
        this.$el.html(this.template(this.model.attributes));
        this.model.set("cellMode", "parts");
    },

    template: _.template('\
        Part Type: &nbsp;&nbsp;<%= partType %><br/>\
        Column Separation:<br/>\
        ')

});