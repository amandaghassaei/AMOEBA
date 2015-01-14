/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler

function Part(nodes, config) {//list of nodes, config tells how nodes are connected
    this.nodes = nodes;
    this.beams = this._createBeams(nodes, config);
};

Part.prototype._createBeams = function(nodes, config){
    var beams = [];
    _.each(config, function(pair){
        beams.push(new Beam(nodes[pair[0]], nodes[pair[2]]));
    });
    return beams;
};

Part.prototype.render = function(scene){
};


Part.prototype.translate = function(dx, dy, dz){
};

Part.prototype.rotate = function(rx, ry, rz){
};




//matt's part
function PartTriangle(nodes){
}

PartTriangle.prototype = new Part(nodes, [[0,1],[1,2],[2,0]]);