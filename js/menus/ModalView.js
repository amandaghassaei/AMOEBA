/**
 * Created by aghassaei on 6/17/15.
 */


define(['jquery', 'underscore', 'backbone', 'text!modalViewTemplate'], function($, _, Backbone, template){

    return Backbone.View.extend({

        el: "#genericModal",

        events: {
            //on close - destroy
        },

        initialize: function(data){
            this.render(data);
        },

        render: function(data){
            this.$el.html(this.template(data));
            this.$el.modal("show");
        },

        destroy: function(){
            this.stopListening();
            this.undelegateEvents();
            this.$el.removeData().unbind();
//            this.remove();//todo not convinced I have this right yet
//            Backbone.View.prototype.remove.call(this);
        },

        template: _.template(template)
    });
});