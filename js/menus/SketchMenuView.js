/**
 * Created by aghassaei on 1/26/15.
 */


SketchMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "slide #zHeightSlider":                           "_moveSketchPlane"
    },

    initialize: function(){

        _.bindAll(this, "render");

    },

    _moveSketchPlane: function(e){
        globals.basePlane.set("zIndex", $(e.target).val());
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "sketch") return;
        if ($("input[type=text]").is(":focus")) return;
        this.$el.html(this.template(globals.basePlane.toJSON()));

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