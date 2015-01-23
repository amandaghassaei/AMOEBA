/**
 * Created by aghassaei on 1/16/15.
 */


FillGeometryView = PushPullMeshView.extend({

    events: {
    },

    defaultColor: 0xf25536,

    initialize: function(options){

        PushPullMeshView.prototype.initialize.apply(this, arguments);

        //bind events
        this.listenTo(this.model, "change:geometry", this.newFillGeometry);
        this.listenTo(this.model, "change:orientation", this.render);

        this.newFillGeometry();
    },

    newFillGeometry: function(){
        if (this.model.previous("mesh")) this.three.sceneRemove(this.model.previous("mesh"));
        this.three.sceneAdd(this.model.get("mesh"));
        this.three.render();
    },



    render: function(){
        this.three.render();
    }
});