//a node, two for each dmaBeam, not to be confused with node.js

function DmaNode(position, index) {
    this._beams = [];//store all beams attached to this node, eventually this will be used to calc global stiffness K
    this.position = position;
    this.index = index;
}

DmaNode.prototype.getIndex = function(){
    return this.index;
};

DmaNode.prototype.getPosition = function(){
    return this.position.clone();
};

DmaNode.prototype.addBeam = function(beam){
    this._beams.push(beam);
};

DmaNode.prototype.destroy = function(){
    this._beams = null;//be sure to remove cyclic reference
    this.position = null;
    this.index = null;
};
