/**
 * Created by aghassaei on 1/16/15.
*/


FillGeometry = Backbone.Model.extend({

    defaults: {
        filename: "No File Loaded",
        mesh: null,
        boundingBox: null//show bounding box for mesh
    },

    initialize: function(){

        //bind events
    },

    buildNewMesh:function(geometry){
        this.removeMesh();

        //center geometry in x and y
        geometry.computeBoundingBox();
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-geometry.boundingBox.min.z));//set on top of baseplane
        geometry.computeBoundingBox();

        var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial(
            {color:0xf25536,
                shading: THREE.FlatShading,
                transparent:true,
                opacity:0.4,
                side:THREE.DoubleSide}));
        this.makeBoundingBox(mesh);
        this.set({mesh: mesh});
        dmaGlobals.three.sceneAdd(mesh, null);
        dmaGlobals.three.render();
    },

    makeBoundingBox: function(mesh){
        var box = new THREE.BoxHelper(mesh);
        box.material.color.setRGB(0,0,0);
        this.set("boundingBox", box);
        dmaGlobals.three.sceneAdd(box);
    },

    updateBoundingBox: function(){
//        this.get("boundingBoxHelper").update();
//        this.trigger("change:boundingBoxHelper");
    },

    subtractGeo: function(){
        dmaGlobals.lattice.subtractMesh(this.get("mesh"));
    },

    removeMesh: function(){
        if (!this.get("mesh")) return;
        dmaGlobals.three.sceneRemove(this.get("mesh"));
        dmaGlobals.three.sceneRemove(this.get("boundingBox"));
        this.set("mesh", null);
        this.set("boundingBox", null);
        this.set("filename", this.defaults.filename);
        dmaGlobals.three.render();
    },

    scale: function(scale){
//        var currentScale = this.get("scale");
//        for (var i=0;i<currentScale.length;i++){
//            if (!scale[i]) scale[i] = currentScale[i];
//        }
//        this.get("mesh").scale.set(scale[0], scale[1], scale[2]);
//        this.set("scale", scale);
    }
});

