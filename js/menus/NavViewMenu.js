/**
 * Created by aghassaei on 5/27/15.
 */


define(['jquery', 'underscore', 'backbone', 'plist', 'lattice', 'text!navViewMenuTemplate'],
    function($, _, Backbone, plist, lattice, template){

    return Backbone.View.extend({

        el: "#navViewMenu",

        events: {
            "click a":                                                    "_makeSelection",
            "click #reset3DView":                                         "_reset3DNavigation",
            "click #videoRendering":                                      "_videoRenderingSetup"
        },

        initialize: function(){

            _.bindAll(this, "render");
        },



        _makeSelection: function(e){
            var $target = $(e.target);
            if ($target.hasClass("customClick")) return;
            e.preventDefault();
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

        _reset3DNavigation: function(e){
            e.preventDefault();
            this.model.reset3DNavigation();
        },

        _videoRenderingSetup: function(e){
            e.preventDefault();
            window.resizeTo(1000, 700);
        },

        render: function(){
            this.$el.html(this.template(_.extend(this.model.toJSON(), plist, lattice.toJSON())));

            var self = this;
            _.each($(".boolProperty"), function(item){
                var $item = $(item);
                if (self.model.get($item.data("property"))) $item.html('<span class="fui-check"></span>' + $item.html());
            })
        },

        template: _.template(template)
    });
});