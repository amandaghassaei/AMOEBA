/**
 * Created by aghassaei on 5/27/15.
 */


define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

    return Backbone.View.extend({

        el: "#navViewMenu",

        events: {
            "click a.boolProperty":                              "_makeSelection",
            "click #reset3DView":                            "_reset3DNavigation"
        },

        initialize: function(){

            _.bindAll(this, "render");
        },


        _makeSelection: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var property = $target.data("property");
            var owner = this._getPropertyOwner($target);
            if (owner) owner.set(property, !owner.get(property));
        },

        _getPropertyOwner: function($target){
            if ($target.hasClass("appState")) return this.model;
            console.warn("no owner found for " + $target);
            return null;
        },

        _reset3DNavigation: function(){
            e.preventDefault();
        },

        render: function(){
            this.$el.html(this.template(this.model.toJSON()));

            var self = this;
            _.each($(".boolProperty"), function(item){
                var $item = $(item);
                if (self.model.get($item.data("property"))) $item.html('<span class="fui-check"></span>' + $item.html());
            })
        },

        template: _.template('\
            <li class="dropdown-submenu">\
            <a tabindex="-1">UI<span class="pull-right fui-arrow-right"></span></a>\
            <ul class="dropdown-menu">\
                <li><a class="appState boolProperty" data-property="menuIsVisible" href="#">Menu</a></li>\
                <li><a class="appState boolProperty" data-property="scriptIsVisible" href="#">Script</a></li>\
                <li><a class="appState boolProperty" data-property="consoleIsVisible" href="#">Console</a></li>\
                <li><a class="appState boolProperty" data-property="ribbonIsVisible" href="#">Ribbon</a></li>\
            </ul></li>\
            <li class="dropdown-submenu">\
            <a tabindex="-1">3D UI<span class="pull-right fui-arrow-right"></span></a>\
            <ul class="dropdown-menu">\
                <li><a class="appState boolProperty" data-property="basePlaneIsVisible" href="#">Sketch Plane</a></li>\
                <li><a class="appState boolProperty" data-property="highlighterIsVisible" href="#">Hover Tool</a></li>\
            </ul></li>\
            <li class="dropdown-submenu">\
            <a tabindex="-1">Rendering<span class="pull-right fui-arrow-right"></span></a>\
            <ul class="dropdown-menu">\
                <li><a class="appState boolProperty" data-property="renderAmbientOcclusion" href="#">Ambient Occlusion</a></li>\
                <li><a class="appState boolProperty" data-property="realisticColorScheme" href="#">Realistic Color Scheme</a></li>\
            </ul></li>\
            <li class="dropdown-submenu">\
            <a tabindex="-1">3D<span class="pull-right fui-arrow-right"></span></a>\
            <ul class="dropdown-menu">\
                <li><a class="appState boolProperty" data-property="axesAreVisible" href="#">Axes</a></li>\
                <li><a id="reset3DView" href="#">Reset 3D Navigation</a></li>\
            </ul></li>\
            ')

    });
});