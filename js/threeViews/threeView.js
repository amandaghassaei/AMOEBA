/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    events: {
        "mousemove":            "mouseMoved",
        "mousedown":            "mouseDown",
        "mouseup":              "mouseUp"
    },

    mouseIsDown: false,//store state of mouse click
    mouseProjection: new THREE.Raycaster(),
    highlightTargets: null,

    el: "#threeContainer",

    controls: null,

    initialize: function(options){

        this.highlightTargets = options.highlightTargets;
        _.bindAll(this, "animate", "mouseMoved");

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);

        this.animate();
    },

    mouseUp: function(){
        this.mouseIsDown = false;
    },

    mouseDown: function(){
        this.mouseIsDown = true;
    },

    mouseMoved: function(e){
        if (this.mouseIsDown) return;//in the middle of a drag event
        var vector = new THREE.Vector2(2*e.pageX/window.innerWidth-1, 1-2*e.pageY/window.innerHeight);
        var camera = this.model.camera;
        this.mouseProjection.setFromCamera(vector, camera);
        var targets = [];
        _.each(this.highlightTargets, function(target){
            console.log(target.boundsBox);
            if (target.boundsBox) target.push(target.boundsBox);
        });
        var intersections = this.mouseProjection.intersectObjects(targets);
        _.each(this.highlightTargets, function(target){
            target.checkHighlight(intersections);
        });
    },

    animate: function(){
        requestAnimationFrame(this.animate);
        this.controls.update();
    }
});