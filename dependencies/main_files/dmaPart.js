/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler



function DmaPart(geometry, nodes) {//list of nodes, config tells how nodes are connected
    this.nodes = nodes;
//    this.beams = this._createBeams(nodes, config);
    this.scale = 10;
    this.geometry = geometry;
    this.render();
}

DmaPart.prototype._createBeams = function(nodes, config){
    var beams = [];
    _.each(config, function(pair){
        beams.push(new Beam(nodes[pair[0]], nodes[pair[2]]));
    });
    return beams;
};

DmaPart.prototype.render = function(){
    //translate geo to nodes
    var midpoint = this.nodes[0].getMidPoint(this.nodes[1]);
//    this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation());


    var mesh = new THREE.Mesh(this.geometry);
    var scale = this.scale*3;
    mesh.scale.set(scale, scale, scale);
//    mesh.rotateZ(Math.PI);

    mesh.position.x = midpoint[0];
    mesh.position.y = midpoint[1];
    mesh.position.z = midpoint[2];


    window.three.sceneAdd(mesh);
    window.three.render();
};


DmaPart.prototype.translate = function(dx, dy, dz){
};

DmaPart.prototype.rotate = function(rx, ry, rz){
};

//////////////////////////////////////////////////////////////
/////////////////SUBCLASSES///////////////////////////////////
//////////////////////////////////////////////////////////////



////matt's part
//function PartTriangle(){
//}
//
//PartTriangle.prototype = new DmaPart();