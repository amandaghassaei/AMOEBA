/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    el: "#threeContainer",

    controls: null,

    initialize: function(){

        _.bindAll(this, "animate");

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);

        this.animate();
    },

    setFillGeometry: function(fillGeometry){//call this once
        this.fillGeometry = fillGeometry;
        this.listenTo(fillGeometry, "change:geometry", this.replaceFillGeometry);
        this.listenTo(fillGeometry, "change:orientation", this.model.render);
        this.replaceFillGeometry();
    },

    replaceFillGeometry: function(){
        if (this.fillGeometry.previous("mesh")) this.model.sceneRemove(this.fillGeometry.previous("mesh"));
        this.model.sceneAdd(this.fillGeometry.get("mesh"));
        this.model.render();
    },

    animate: function(){
        requestAnimationFrame(this.animate);
        this.controls.update();
    }
});