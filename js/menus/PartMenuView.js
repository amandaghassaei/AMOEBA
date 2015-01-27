/**
 * Created by aghassaei on 1/26/15.
 */

PartMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    currentlySelected: false,

    initialize: function(){

        _.bindAll(this, "render");
        this.listenTo(this.model, "change:partType", this.render);
    },

    render: function(){
        this.currentlySelected = true;//if this causes a change, render must have been called from menu wrapper
        this.$el.html(this.template(this.model.attributes));
        this.model.set("cellMode", "parts");
    },

    template: _.template('\
        Part Type: &nbsp;&nbsp;<%= partType %><br/>\
        ')

});