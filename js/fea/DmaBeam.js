/*
Created by aghassaei on 1/13/15.
 */


//a single beam, made from two nodes

var unitGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);


function DmaBeam(node1, node2) {
    this.nodes = [node1, node2];
    var self = this;
    _.each(this.nodes, function(node){//give each node a reference to the new beam it is connected to
        node.addBeam(self);
    });
}

DmaBeam.prototype.getIndex = function(){
    var index = [];
    _.each(this.nodes, function(node){
        index.push(node.getIndex());
    });
    return index;
};

DmaBeam.prototype._buildBeamMesh = function(){
    var mesh = new THREE.Mesh(unitGeo);

    var position = this.nodes[0].getPosition();
    position.sub(this.nodes[1].getPosition());
    position.multiplyScalar(0.5);
    mesh.position.set(position);
    return mesh;
};

DmaBeam.prototype.render = function(scene){
    if (!this.mesh) this.mesh = this._buildBeamMesh();
};

DmaBeam.prototype.calcStiffnessMatrix = function(){

//    var L = 0;
//    var A = 0;
//    var Iy = 0;
//    var Iz = 0;
//    var E = 0;
//    var G = 0;
//
//
//    var K = [
//        [A*E/L , 0 , 0 , 0 , 0 , 0 , -A*E/L , 0 , 0 , 0 , 0 , 0] ,//d1x
//  		[0 , 12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , 6*E*Iz/Math.pow(L, 2) , 0 , -12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , 6*E*Iz/Math.pow(L, 2)] ,//d1y
//  		[0 , 0 , 12*E*Iy/Math.pow(L, 3) , 0 , -6*E*Iy/Math.pow(L, 2) , 0 , 0 , 0 , -12*E*Iy/Math.pow(L, 3) , 0 , -6*E*Iy/Math.pow(L, 2) , 0] ,//d1z
//  		[0 , 0 , 0 , G*J/L , 0 , 0 , 0 , 0 , 0 , -G*J/L , 0 , 0] , //r1x
//  		[0 , 0 , -6*E*Iy/Math.pow(L, 2) , 0 , 4*E*Iy/L , 0 , 0 , 0 , 6*E*Iy/Math.pow(L, 2) , 0 , 2*E*Iy/L , 0] ,//r1y
//  		[0 , 6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 4*E*Iz/L , 0 , -6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 2*E*Iz/L] ,//r1z
//  		[-A*E/L , 0 , 0 , 0 , 0 , 0 , A*E/L , 0 , 0 , 0 , 0 , 0] , //d2x
//  		[0 , -12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , -6*E*Iz/Math.pow(L, 2) , 0 , 12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , -6*E*Iz/Math.pow(L, 2)] ,//d2y
//  		[0 , 0 , -12*E*Iy/Math.pow(L, 3) , 0 , 6*E*Iy/Math.pow(L, 2) , 0 , 0 , 0 , 12*E*Iy/Math.pow(L, 3) , 0 , 6*E*Iy/Math.pow(L, 2) , 0] ,//d2z
//  		[0 , 0 , 0 , -G*J/L , 0 , 0 , 0 , 0 , 0 , G*J/L , 0 , 0] ,//r2x
//  		[0 , 0 , -6*E*Iy/Math.pow(L, 2) , 0 , 2*E*Iy/L , 0 , 0 , 0 , 6*E*Iy/Math.pow(L, 2) , 0 , 4*E*Iy/L , 0] ,//r2y
//  		[0 , 6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 2*E*Iz/L , 0 , -6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 4*E*Iz/L]//r2z
//  	];
};


