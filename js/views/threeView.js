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

    animate: function(){
        requestAnimationFrame(this.animate);
        this.controls.update();
    }
});