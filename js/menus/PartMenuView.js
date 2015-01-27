/**
 * Created by aghassaei on 1/26/15.
 */

PartMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render");
    },

    render: function(){
        this.$el.html(this.template());
    },

    template: _.template('\
        Part Type: <br/>\
        ')

});