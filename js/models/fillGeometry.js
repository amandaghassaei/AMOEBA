/**
 * Created by aghassaei on 1/16/15.
*/


FillGeometry = Backbone.Model.extend({

    defaults: {
        material: new THREE.MeshLambertMaterial(
            {color:0xf25536,
                shading: THREE.FlatShading,
                transparent:true,
                opacity:0.5,
                side:THREE.DoubleSide}),
        geometry: new THREE.BoxGeometry(100, 100, 100),
        filename: "Cube",
        orientation: [0,0,0],
        scale: [1.0,1.0,1.0]
    },

    initialize: function(){

        //bind events
        this.on("change:mesh", this.getBounds);
        this.on("change:orientation change:scale", this.updateBoundingBox);
        this.on("change:geometry", this.buildNewMesh);

        this.buildNewMesh();
    },

    buildNewMesh:function(){
        this.set({orientation:this.defaults.orientation, scale:this.defaults.scale}, {silent:true});//restore defaults
        var mesh = new THREE.Mesh(this.get("geometry"), this.get("material"));
        this.makeBoundingBoxHelper(mesh);
        this.set({mesh: mesh});

        //send new geometry out to workers
//            _.each(workers.allWorkers, function(worker){
//                worker.postMessage({model: this.toJSON});
//            });
    },

    getBounds: function(){//bounds is the bounding box of the mesh geometry (before scaling)
        this.get("mesh").geometry.computeBoundingBox();
        this.set("bounds", this.get("geometry").boundingBox.clone());
    },

    makeBoundingBoxHelper: function(mesh){
        var helper = new THREE.BoundingBoxHelper(mesh, 0x000000);
        helper.update();
        this.set("boundingBoxHelper", helper);
    },

    updateBoundingBox: function(){
        this.get("boundingBoxHelper").update();
        this.trigger("change:boundingBoxHelper");
    },

    rotate: function(axis){
        var orientation = this.get("orientation").slice(0);//make a copy so that set triggers change event
        var mesh = this.get("mesh");
        var piOver2 = Math.PI/2;
        if (axis == "x"){
            mesh.rotateX(piOver2);
            orientation[0] += piOver2;
        } else if (axis == "y"){
            mesh.rotateX(piOver2);
            orientation[1] += piOver2;
        } else {
            mesh.rotateX(piOver2);
            orientation[2] += piOver2;
        }
        this.set("orientation", orientation);
    }
});

