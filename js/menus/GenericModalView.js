/**
 * Created by amandaghassaei on 3/8/17.
 */

define(['jquery', 'underscore', 'backbone', 'plist', 'text!menus/templates/GenericModalView.html'],
    function($, _, Backbone, plist, template){

        var defaultData = {
            title: "",
            message: "",
            affirmation: "OK",
            buttonStyle: "success"
        };

        return Backbone.View.extend({

            el: "#genericModal",

            events: {
                "click #affirmGenericModal": 'affirm'//todo does this cause conflict if multiple instances used?
            },

            initialize: function(){
            },

            affirm: function(){
                if (this.callback) this.callback();
                this.$el.modal("hide");
            },

            render: function(options){
                this.callback = options.callback;
                if (!options.title) options.title = defaultData.title;
                if (!options.message) options.message = defaultData.message;
                if (!options.affirmation) options.affirmation = defaultData.affirmation;
                if (!options.buttonStyle) options.buttonStyle = defaultData.buttonStyle;

                this.$el.html(this.template(options));
                this.$el.modal("show");
            },

            template: _.template(template)
        });
});