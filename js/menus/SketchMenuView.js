/**
 * Created by aghassaei on 1/26/15.
 */


SketchMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "slide #zHeightSlider":                           "_moveSketchPlane"
    },

    initialize: function(options){

        this.appState = options.appState;

        _.bindAll(this, "render");

    },

    _moveSketchPlane: function(e){
        this.model.get("basePlane").set("zIndex", $(e.target).val());
    },

    render: function(){
        if (this.appState.get("currentTab") != "sketch") return;
        this.$el.html(this.template(this.model.get("basePlane").attributes));

        $('#zHeightSlider').slider({
            formatter: function(value) {
                return value;
            }
        });
    },

    template: _.template('\
        Sketch Plane Height:&nbsp;&nbsp;<input id="zHeightSlider" data-slider-id="ex1Slider" type="text" data-slider-min="0" data-slider-max="20" data-slider-step="2" data-slider-value="<%= zIndex %>"/>\
        ')

});