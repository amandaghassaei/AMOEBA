/**
 * Created by aghassaei on 1/16/15.
*/


FillGeometry = Backbone.Model.extend({

    defaults: {
        scale: 1.0,
        material: new THREE.MeshLambertMaterial(
            {color:0xffa500,
                shading: THREE.FlatShading,
                transparent:true,
                opacity:0.5,
                side:THREE.DoubleSide}),
        geometry: new THREE.BoxGeometry(100, 100, 100),
        filename: "no file loaded",
        dimensions: "",
        orientation: ""
    },

    initialize: function(){

        this.buildNewMesh();
        this.renderMesh();

        //bind events
        this.on("change:mesh change:scale change:orientation", this.renderMesh);
        this.on("change:geometry", this.buildNewMesh);
    },

    buildNewMesh:function(){

        three.trigger("threeRemove", this.previous("mesh"));//remove current mesh from scene
        this.set(_.omit(this.defaults, ["geometry", "material"]), {silent:true});//restore defaults
        this.set(
            {mesh: new THREE.Mesh(this.get("geometry"), this.get("material"))});
//            _.each(workers.allWorkers, function(worker){
//                worker.postMessage({model: JSON.stringify(e.content)});
//            });
    },

    renderMesh: function(){
        console.log("renderfillgeo");
        three.trigger("threeAdd", this.get("mesh"));
        three.trigger("threeRender");
    },

    rotate: function(axis){
        var mesh = this.get("mesh");
        if (axis == "x"){
            mesh.rotateX(Math.PI/2);
        } else if (axis == "y"){
            mesh.rotateX(Math.PI/2);
        } else {
            mesh.rotateX(Math.PI/2);
        }
    }

});

