/**
 * Created by aghassaei on 2/25/15.
 */

OptimizationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.get("currentTab") != "optimize") return;
        this.$el.html(this.template());
    },

    template: _.template('\
        input stiffness requirements of structure\
        ')

});