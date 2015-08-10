/**
 * Created by aghassaei on 5/27/15.
 */


define(['jquery', 'underscore', 'backbone', 'plist', 'text!navViewMenuTemplate'], function($, _, Backbone, plist, template){

    return Backbone.View.extend({

        el: "#navViewMenu",

        events: {
            "click a":                                       "_makeSelection",
            "click #reset3DView":                            "_reset3DNavigation"
        },

        initialize: function(){

            _.bindAll(this, "render");
        },


        _makeSelection: function(e){
            e.preventDefault();
            var $target = $(e.target);
            if ($target.prop("tagName") == "SPAN") $target = $target.parent();
            var property = $target.data("property");
            var value = $target.data("value");
            var owner = this._getPropertyOwner($target);
            if (owner) {
                if (value) owner.set(property, value);
                else owner.set(property, !owner.get(property));
            }
        },

        _getPropertyOwner: function($target){
            if ($target.hasClass("appState")) return this.model;
            console.warn("no owner found for:");
            console.warn($target);
            return null;
        },

        _reset3DNavigation: function(){
            e.preventDefault();
        },

        render: function(){
            this.$el.html(this.template(_.extend(this.model.toJSON(), plist)));

            var self = this;
            _.each($(".boolProperty"), function(item){
                var $item = $(item);
                if (self.model.get($item.data("property"))) $item.html('<span class="fui-check"></span>' + $item.html());
            })
        },

        template: _.template(template)
    });
});