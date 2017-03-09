/**
 * Created by amandaghassaei on 3/8/17.
 */


define(['jquery', 'underscore', 'backbone', 'plist', 'text!menus/templates/NavViewMenuView.html'],
    function($, _, Backbone, plist, template){

    return Backbone.View.extend({

        el: "#navViewMenuView",

        events: {
            "click .cameraType": 'changeCamera'
        },

        initialize: function(){

            _.bindAll(this, "render");

        },

        changeCamera: function(e){
            e.preventDefault();
            var type = $(e.target).data("id");
            console.log(type);
        },

        render: function(){
            this.$el.html(this.template(plist));
        },


        template: _.template(template)
    });
});