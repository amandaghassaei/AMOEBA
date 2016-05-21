/**
 * Created by ghassaei on 5/21/16.
 */

define(['jquery', 'underscore', 'backbone', 'text!menus/templates/NavHierarchicalMenu.html'],
    function($, _, Backbone, template){

    return Backbone.View.extend({

        el: "#navHierarchicalMenu",

        events: {
            "click a":                                                    "_makeSelection"
        },

        initialize: function(){
            _.bindAll(this, "render");
        },



        _makeSelection: function(e){
            e.preventDefault();
            var $target = $(e.target);
            if ($target.data("hierlevel")) this.model.set("hierLevel", $target.data("hierlevel"));
            console.log(this.model.get("hierLevel"));
        },


        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
        },

        template: _.template(template)
    });
});