/**
 * Created by aghassaei on 1/16/15.
 */


Lattice = Backbone.Model.extend({

    defaults: {
        scale: 30.0,
        translation: new THREE.Vector3(0,0,0),
        rotation: new THREE.Vector3(0,0,0),
        type: "octagonFace",
        nodes: [],
        min: new THREE.Vector3(0,0,0),
        max: new THREE.Vector3(0,0,0)
    },

    //pass in fillGeometry

    initialize: function(){

        //bind events

        this.layoutNodes();

    },

    layoutNodes: function(type){
        type = type || this.get("type");
        var boundingBox = this.get("fillGeometry").get("boundingBoxHelper").box;
        var scale = this.get("scale");

        var nodes;

        if (type == "octagonFace"){
            nodes = this.faceConnectedOctahedra(boundingBox, scale);


        } else {
            console.log("no type");
        }
        this.set("nodes", nodes);
    },

    faceConnectedOctahedra: function(boundingBox, scale){

        var scaleSqrt3 = scale/2*Math.sqrt(3);
        var dimX = Math.round((boundingBox.max.x-boundingBox.min.x)/scale);
        var dimY = Math.round((boundingBox.max.y-boundingBox.min.y)/scaleSqrt3);
        var dimZ = Math.round((boundingBox.max.z-boundingBox.min.z)/scaleSqrt3);


        var nodes = [];

        for (var x=0; x<=dimX; x++){
            if (nodes.length<=x) nodes[x] = [];
            for (var y=0; y<=dimY; y++){
                if (nodes[x].length<=y) nodes[x][y] = [];
                for (var z=0; z<=dimZ; z++){

                    var xOffset = 0;
                    if (y%2 == 1) xOffset = scale/2;
                    var yOffset = 0;
                    if (z%2 == 1) yOffset  = scaleSqrt3/2;

                    nodes[x][y][z] = new BeamNode(boundingBox.min.x+ xOffset + scale*x,
                        boundingBox.min.y + yOffset + scaleSqrt3*y,
                        boundingBox.min.z + z*scaleSqrt3);
                }
            }
        }
        return nodes;
    },

    fillWithParts: function(){


    }

});