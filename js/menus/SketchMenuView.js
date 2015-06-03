/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist'], function($, _, MenuParentView, plist){

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

        template: _.template('\
            Sketch Plane Height:&nbsp;&nbsp;<input id="zHeightSlider" data-slider-id="ex1Slider" type="text" data-slider-min="0" data-slider-max="20" data-slider-step="1" data-slider-value="<%= zIndex %>"/>\
            <br/><br/>\
            todo: Sketch and extrude/cut commands\
            ')

    });
});