/**
 * Created by aghassaei on 2/25/15.
 */

MaterialMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "material") return;
        this.$el.html(this.template());
    },

    template: _.template('\
        create materials and assign them to parts in the model\
        <br/><br/>\
        stiffness, elastic modulus\
        ')

});