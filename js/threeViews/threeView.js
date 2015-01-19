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
    projectionTargets: null,
    highlightTargets: null,
    meshHandle: null,
    cubeGeometry: new THREE.BoxGeometry(5,5,5),
    cubeMaterial: new THREE.MeshLambertMaterial({color:0x0000ff, shading:THREE.FlatShading, vertexColors:THREE.FaceColors}),

    el: "#threeContainer",

    controls: null,

    initialize: function(options){

        this.highlightTargets = options.highlightTargets;
        this.projectionTargets = [];
        var self = this;
        _.each(this.highlightTargets, function(target){
            if (target.boundsBox) self.projectionTargets.push(target.boundsBox);
        });
        _.bindAll(this, "animate", "mouseMoved");

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.meshHandle = new MeshHandle(this.model);

        this.$el.append(this.model.domElement);

        this.animate();
    },

    mouseUp: function(){
        this.mouseIsDown = false;
    },

    mouseDown: function(e){
        this.mouseIsDown = true;

        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        var camera = this.model.camera;
        this.mouseProjection.setFromCamera(vector, camera);
        var intersections = this.mouseProjection.intersectObjects(this.model.objects);

                console.log(intersections);

        if (intersections.length>1){
            var voxel = new THREE.Mesh(this.cubeGeometry);
            voxel.position.copy(intersections[1].point);
            if (intersections[1].face) voxel.position.add(intersections[1].face.normal);
            voxel.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
            this.model.sceneAdd(voxel);
            this.model.render();
        }
    },

    mouseMoved: function(e){
        if (this.mouseIsDown) return;//in the middle of a drag event
        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        var camera = this.model.camera;
        this.mouseProjection.setFromCamera(vector, camera);
        var intersections = this.mouseProjection.intersectObjects(this.model.objects);


//        _.each(this.highlightTargets, function(target){
//            target.checkHighlight(intersections);
//        });
    },

//    getTopObject: function(targets, intersections, index){
//        if (intersections.length<index) return null;
//        if (intersections.)
//        this.getTopObject(targets, intersections, index+1);
//    }

    animate: function(){
        requestAnimationFrame(this.animate);
        this.controls.update();
    }
});