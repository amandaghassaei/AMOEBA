//a node, two for each dmaBeam, not to be confused with node.js

function BeamNode() {
    this._beams = [];//store all beams attached to this node, eventually this will be used to calc global stiffness K
}

BeamNode.prototype.addBeam = function(beam){
    this._beams.push(beam);
};

BeamNode.prototype.render = function(scene){
};


BeamNode.prototype.deflect = function(dx, dy, dz){
};

BeamNode.prototype.translate = function(dx, dy, dz){
};

BeamNode.prototype.rotate = function(rx, ry, rz){
};

BeamNode.prototype.destroy = function(){
    this._beam = null;//be sure to remove cyclic reference
    this = null;
};
