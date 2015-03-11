/**
 * Created by aghassaei on 3/11/15.
 */

SendMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.get("currentTab") != "send") return;
        this.$el.html(this.template());
    },

    template: _.template('\
        send commands to machine\
        ')

});