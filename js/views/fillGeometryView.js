/**
 * Created by aghassaei on 1/16/15.
 */


FillGeometryView = Backbone.View.extend({

    events: {


    },

    initialize: function(options){

        this.three = options.three;

        //bind events
        this.listenTo(this.model, "change:geometry", this.replaceFillGeometry);
        this.listenTo(this.model, "change:orientation", this.render);

        this.replaceFillGeometry();
    },

    replaceFillGeometry: function(){
        if (this.model.previous("mesh")) this.three.sceneRemove(this.model.previous("mesh"));
        this.three.sceneAdd(this.model.get("mesh"));
        this.three.render();
    },

    render: function(){
        this.three.render();
    }
});