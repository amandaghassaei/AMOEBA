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

    fillWithParts: function(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-2.3580117225646973,-0.32,0));
//        var scale = this.scale*3;
//        geometry.makeScale(scale, scale, scale);

        var nodes = this.get("nodes");
        if (!this.nodesFilled(nodes)) return;

        var rot60 = geometry.clone();
        rot60.applyMatrix(new THREE.Matrix4().makeRotationZ(2*Math.PI/3));

        var rot120 = geometry.clone();
        rot120.applyMatrix(new THREE.Matrix4().makeRotationZ(4*Math.PI/3));

        var rot180 = geometry.clone();
        rot180.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));

        var rot240 = geometry.clone();
        rot240.applyMatrix(new THREE.Matrix4().makeRotationZ(5*Math.PI/3));

        var rot300 = geometry.clone();
        rot300.applyMatrix(new THREE.Matrix4().makeRotationZ(1*Math.PI/3));



        for (var z=1;z<nodes[0][0].length;z++){
            for (var y= 0;y<nodes[0].length-1;y++){
                for (var x=0;x<nodes.length-1;x++){


                    if (z%2==1){
                        new DmaPart(geometry, [nodes[x][y][z], nodes[x+1][y][z], nodes[x][y+1][z-1]]);

                        if (y%2 == 0) new DmaPart(rot60, [nodes[x][y][z], nodes[x+1][y+1][z], nodes[x][y+1][z-1]]);
                        else new DmaPart(rot120, [nodes[x][y][z], nodes[x+1][y+1][z], nodes[x][y+1][z-1]]);

                        if (y%2 == 0) new DmaPart(rot120, [nodes[x][y][z], nodes[x][y+1][z], nodes[x][y+1][z-1]]);
                        else new DmaPart(rot60, [nodes[x][y][z], nodes[x][y+1][z], nodes[x][y+1][z-1]]);
                    } else {

                        new DmaPart(rot180, [nodes[x][y][z], nodes[x+1][y][z], nodes[x][y+1][z-1]]);

                        if (y%2 == 0) new DmaPart(rot240, [nodes[x][y][z], nodes[x+1][y+1][z], nodes[x][y+1][z-1]]);
                        else new DmaPart(rot300, [nodes[x][y][z], nodes[x+1][y+1][z], nodes[x][y+1][z-1]]);

                        if (y%2 == 0) new DmaPart(rot300, [nodes[x][y][z], nodes[x][y+1][z], nodes[x][y+1][z-1]]);
                        else new DmaPart(rot240, [nodes[x][y][z], nodes[x][y+1][z], nodes[x][y+1][z-1]]);

                    }
                }
            }
        }







    },

    nodesFilled: function(nodes){
        if (!nodes) return false;
        if (nodes.length == 0) return false;
        if (nodes[0].length == 0) return false;
        return (nodes[0][0].length > 0);
    }

});