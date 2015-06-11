/**
 * Created by aghassaei on 6/2/15.
 */


define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

    return Backbone.View.extend({

        el: "#menuContent",

        initialize: function(){

            _.bindAll(this, "render");

            if (this._initialize) this._initialize();//call subclass
        },

        render: function(){
            if (this.model.changedAttributes()["currentNav"]) return;
            if ($("input[type=text]").is(":focus")) return;
            this.$el.html(this.template(this._makeTemplateJSON()));
            if (this._render) this._render();
        },

        destroy: function(){
            this.stopListening();
            this.undelegateEvents();
            this.$el.removeData().unbind();
//            this.remove();//todo not convinced I have this right yet
//            Backbone.View.prototype.remove.call(this);
        }

    });
});