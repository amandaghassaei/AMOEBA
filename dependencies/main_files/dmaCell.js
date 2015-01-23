/**
 * Created by aghassaei on 1/14/15.
 */


//a Cell, a unit piece of the lattice

function Cell(nodes, config) {
    this.parts = this._createParts(nodes, config);
};

Cell.prototype._createParts = function(nodes, config){
    var parts  = [];
    for (var i=0;i<nodes.length;i++){
        parts.push(new Part(nodes[i], config[i]));
    }
    return parts;
};

Cell.prototype.render = function(scene){
};


Cell.prototype.translate = function(dx, dy, dz){
};

Cell.prototype.rotate = function(rx, ry, rz){
};
