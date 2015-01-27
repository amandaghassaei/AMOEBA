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
    },

    render: function(){
        this.$el.html(this.template(this.model.attributes));
    },

    template: _.template('\
        Part Type: &nbsp;&nbsp;<%= partType %><br/>\
        ')

});