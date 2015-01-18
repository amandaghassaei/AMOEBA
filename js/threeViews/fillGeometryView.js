/**
 * Created by aghassaei on 1/16/15.
 */


FillGeometryView = PushPullMeshView.extend({

    events: {
    },

    boundsBox: new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100)),
    boxHelper: new THREE.BoxHelper(this.boundsBox),

    initialize: function(options){

        PushPullMeshView.prototype.initialize.apply(this, arguments);

        //bind events
        this.listenTo(this.model, "change:geometry", this.newFillGeometry);
        this.listenTo(this.model, "change:orientation", this.render);
        this.listenTo(this.model, "change:bounds change:scale change:orientation", this.updateBounds);

        this.newFillGeometry();
        this.drawBounds();
    },

    newFillGeometry: function(){
        if (this.model.previous("mesh")) this.three.sceneRemove(this.model.previous("mesh"));
        this.three.sceneAdd(this.model.get("mesh"));
        this.three.render();
    },

    drawBounds: function(){
        this.boxHelper.material.color.set(0xf25536);
        this.three.sceneAdd(this.boxHelper);
        this.updateBounds();
    },

    updateBounds: function(){
        var bounds = this.model.get("bounds");//this has not been scaled or rotated, as is when model was first imported
        var max = bounds.max.toArray();
        var min = bounds.min.toArray();
        var size = numeric.sub(max, min);
        var translation = numeric.mul(numeric.add(max, min), 0.5);
        var geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(translation[0], translation[1], translation[2]));
        this.boundsBox.geometry = geometry;
        this.boxHelper.update(this.boundsBox);
        this.render();
    },

    render: function(){
        this.three.render();
    }
});