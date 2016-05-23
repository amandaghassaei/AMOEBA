/**
 * Created by aghassaei on 6/17/15.
 */


define(['jquery', 'underscore', 'backbone', 'text!menus/templates/ModalView.html', 'text!menus/templates/ModalViewSmall.html'],
    function($, _, Backbone, template, templateSmall){

    return Backbone.View.extend({

        el: "#genericModal",

        events: {
            //on close - destroy
        },

        initialize: function(data){
            this.render(data);
        },

        render: function(data){
            if (data.small){
                this.$el.html(this.templateSmall(data));
            } else {
                this.$el.html(this.template(data));
            }
            this.$el.modal("show");
        },

        destroy: function(){
            this.stopListening();
            this.undelegateEvents();
            this.$el.removeData().unbind();
//            this.remove();//todo not convinced I have this right yet
//            Backbone.View.prototype.remove.call(this);
        },

        template: _.template(template),
        templateSmall: _.template(templateSmall)
    });
});