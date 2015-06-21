/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!sketchMenuTemplate'], function($, _, MenuParentView, plist, template){

    return MenuParentView.extend({

        events: {
            "slide #zHeightSlider":                           "_moveSketchPlane"
        },

        _initialize: function(){

        },

        _moveSketchPlane: function(e){
            globals.basePlane.set("zIndex", $(e.target).val());
        },

        _makeTemplateJSON: function(){
            return globals.basePlane.toJSON();
        },

        _render: function(){
            $('#zHeightSlider').slider({
                formatter: function(value) {
                    return value;
                }
            });
        },

        template: _.template(template)
    });
});