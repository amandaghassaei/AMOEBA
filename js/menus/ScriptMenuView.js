/**
 * Created by aghassaei on 1/26/15.
 */

ScriptMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.get("currentTab") != "script") return;
        this.$el.html(this.template());
    },

    template: _.template('\
        some kind of scripting functionality?\
        ')

});