/**
 * Created by aghassaei on 1/16/15.
*/


FillGeometry = Backbone.Model.extend({

    defaults: {
        material: new THREE.MeshLambertMaterial(
            {color:0xf25536,
                shading: THREE.FlatShading,
                transparent:true,
                opacity:0.4,
                side:THREE.DoubleSide}),
        geometry: null,
        filename: "No File Loaded",
        orientation: [0,0,0],
        scale: [1.0,1.0,1.0],
        mesh: null,
    },

    initialize: function(options){

        this.lattice = options.lattice;

        //bind events
        this.on("change:mesh", this.getBounds);
        this.on("change:orientation change:scale", this.updateBoundingBox);
        this.on("change:geometry", this.buildNewMesh);

    },

    buildNewMesh:function(){
        this.remove();

        //center geometry in x and y
        var geometry = this.get("geometry");
        geometry.computeBoundingBox();
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-geometry.boundingBox.max.x/2,-geometry.boundingBox.max.y/2,0));

        this.set({orientation:this.defaults.orientation, scale:this.defaults.scale}, {silent:true});//restore defaults
        var mesh = new THREE.Mesh(this.get("geometry"), this.get("material"));
        this.makeBoundingBoxHelper(mesh);
        this.set({mesh: mesh});
        dmaGlobals.three.sceneAdd(mesh, null);
        dmaGlobals.three.render();

        //send new geometry out to workers
//            _.each(workers.allWorkers, function(worker){
//                worker.postMessage({model: this.toJSON});
//            });
    },

    getBounds: function(){//bounds is the bounding box of the mesh geometry (before scaling)
//        this.get("mesh").geometry.computeBoundingBox();
//        this.set("bounds", this.get("geometry").boundingBox.clone());
    },

    makeBoundingBoxHelper: function(mesh){
//        var helper = new THREE.BoundingBoxHelper(mesh, 0x000000);
//        helper.update();
//        this.set("boundingBoxHelper", helper);
    },

    updateBoundingBox: function(){
//        this.get("boundingBoxHelper").update();
//        this.trigger("change:boundingBoxHelper");
    },

    subtractGeo: function(){
        this.lattice.subtractMesh(this.get("mesh"));
    },

    remove: function(){
        if (!this.get("mesh")) return;
        dmaGlobals.three.sceneRemove(this.get("mesh"), null);
        this.set("mesh", null);
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

