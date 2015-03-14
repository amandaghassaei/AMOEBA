/*
Created by aghassaei on 1/13/15.
 */


//a single beam, made from two nodes

var unitGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);


function DmaBeam(node1, node2, parent) {
    this.nodes = [node1, node2];
    this.parentCell = parent;
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

    var diff = this.nodes[0].getPosition();
    diff.sub(this.nodes[1].getPosition());

    var quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), diff.normalize());
    var eulerRot = new THREE.Euler().setFromQuaternion(quaternion);
    mesh.rotation.set(eulerRot.x, eulerRot.y, eulerRot.z);

    dmaGlobals.three.sceneAdd(mesh, "part");
    return mesh;
};

DmaBeam.prototype.updateForScale = function(scale){
    if (!this.mesh) this.mesh = this._buildBeamMesh();
    var position = this.nodes[0].getPosition();
    position.add(this.nodes[1].getPosition());
    position.multiplyScalar(0.5);
    position.add(this.parentCell.getPosition());
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.scale.set(scale, scale, scale);
};

DmaBeam.prototype.setVisibility = function(visible){
    if (visible && !this.mesh) {
        this.mesh = this._buildBeamMesh();
        this.updateForScale(this.parentCell.getScale());
    }
    else if (!this.mesh) return;
    this.mesh.visible = visible;
};

DmaBeam.prototype.destroy = function(){
    dmaGlobals.three.sceneRemove(this.mesh, "part");
    this.mesh = null;
    var self = this;
    _.each(this.nodes, function(node){
        node.removeBeam(self);
    });
    this.nodes = null;
    this.parentCell = null;
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


