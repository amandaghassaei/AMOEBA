/**
 * Created by aghassaei on 1/16/15.
*/


FillGeometry = Backbone.Model.extend({

    defaults: {
        material: new THREE.MeshLambertMaterial(
            {color:0xffa500,
                shading: THREE.FlatShading,
                transparent:true,
                opacity:0.5,
                side:THREE.DoubleSide}),
        geometry: new THREE.BoxGeometry(100, 100, 100),
        filename: "Cube",
        orientation: [0,0,0]
    },

    initialize: function(){

        //bind events
        this.on("change:mesh", this.getBounds);
        this.on("change:mesh", this.makeBoundingBoxHelper);
        this.on("change:orientation", this.updateBoundingBox);
        this.on("change:geometry", this.buildNewMesh);
        this.on("change:mesh change:orientation", this.render);

        this.buildNewMesh();
    },

    buildNewMesh:function(){

        if (this.previous("mesh")) three.scene.remove(this.previous("mesh"));//remove current mesh from scene
        this.set({orientation:this.defaults.orientation}, {silent:true});//restore defaults
        var mesh = new THREE.Mesh(this.get("geometry"), this.get("material"));
        three.scene.add(mesh);
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

    makeBoundingBoxHelper: function(){
        var helper = new THREE.BoundingBoxHelper(this.get("mesh"), 0x000000);
        this.set("boundingBoxHelper", helper);
        helper.update();
        three.scene.add(helper.object);
        this.trigger("change:boundingBoxHelper");
    },

    updateBoundingBox: function(){
        this.get("boundingBoxHelper").update();
        this.trigger("change:boundingBoxHelper");
    },

    render: function(){
        console.log("renderfillgeo");
        three.render();
    },

    rotate: function(axis){
        var orientation = this.get("orientation");
        var mesh = this.get("mesh");
        if (axis == "x"){
            mesh.rotateX(Math.PI/2);
            orientation[0] += Math.PI/2;
        } else if (axis == "y"){
            mesh.rotateX(Math.PI/2);
            orientation[1] += Math.PI/2;
        } else {
            mesh.rotateX(Math.PI/2);
            orientation[2] += Math.PI/2;
        }
        this.trigger("change:orientation");
    }

});

