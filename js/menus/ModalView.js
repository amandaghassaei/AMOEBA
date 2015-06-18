/**
 * Created by aghassaei on 6/17/15.
 */


define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

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

        template: _.template('\
            <div class="modal-dialog modal-med">\
                <div class="modal-content">\
                    <div class="modal-header">\
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                    <p class="modal-title" ><%= title %></p>\
                    </div>\
                    <div class="modal-body">\
                    <% if (typeof img !== "undefined") {%>\
                    <img class="fullWidth" src="<%= img %>"><br/><br/>\
                    <% } %>\
                    <% if (text == ""){ %>\
                    Need something here.\
                    <% } else { %>\
                        <%= text %>\
                    <% } %>\
                    </div>\
                </div>\
            </div>\
        ')

    });
});