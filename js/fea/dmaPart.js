/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler



function DmaPart(geometry) {//list of nodes, config tells how nodes are connected
//    this.nodes = nodes;
//    this.beams = this._createBeams(nodes, config);
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
    var mesh = new THREE.Mesh(this.geometry);
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