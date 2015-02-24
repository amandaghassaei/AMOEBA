//a node, two for each dmaBeam, not to be confused with node.js

function BeamNode(x, y, z) {
    this._beams = [];//store all beams attached to this node, eventually this will be used to calc global stiffness K
    this.x = x;
    this.y = y;
    this.z = z;
    this.render();
}

BeamNode.prototype.addBeam = function(beam){
    this._beams.push(beam);
};

BeamNode.prototype.render = function(){

    var geometry = new THREE.BoxGeometry(2,2,2);
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation(this.x, this.y, this.z) );
    var mesh = new THREE.Mesh(geometry);

//    dmaGlobals.three.sceneAdd(mesh);
};


BeamNode.prototype.deflect = function(dx, dy, dz){
};

BeamNode.prototype.translate = function(dx, dy, dz){
    this.x += dx;
    this.y += dy;
    this.z += dz;
};

BeamNode.prototype.translateAbsolute = function(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
};

BeamNode.prototype.rotate = function(rx, ry, rz){
};

BeamNode.prototype.destroy = function(){
    this._beams = null;//be sure to remove cyclic reference
};

BeamNode.prototype.getMidPoint = function(node){

    var x = (node.x+this.x)/2;
    var y = (node.y+this.y)/2;
    var z = (node.z+this.z)/2;

    return [x,y,z];

}
