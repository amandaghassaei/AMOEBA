/**
 * Created by aghassaei on 6/2/15.
 */


define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

    return Backbone.View.extend({

        el: "#menuContent",

        initialize: function(options){

            _.bindAll(this, "render");

            if (this._initialize) this._initialize(options);//call subclass
        },

        getPropertyOwner: function($target){
            return null;//override in subclasses
        },

        deleteExitMenu: function(e){
            return true;
        },

        cancelExitMenu: function(e){
            return true;
        },

        saveExitMenu: function(e){
            return true;
        },

        shouldRender: function(){
            return true;
        },

        render: function(){
            if (!this.shouldRender()) return;
            if (this.model.changedAttributes()["currentNav"]) return;
            if ($("input[type=text]").is(":focus")) return;
            if (this._preRender) this._preRender();
            this.$el.html(this.template(this._makeTemplateJSON()));
            if (this._render) this._render();
        },

        destroy: function(){
            if (this._destroy) this._destroy();
            this.stopListening();
            this.undelegateEvents();
            this.$el.removeData().unbind();
//            this.remove();//todo not convinced I have this right yet
//            Backbone.View.prototype.remove.call(this);
        }

    });
});