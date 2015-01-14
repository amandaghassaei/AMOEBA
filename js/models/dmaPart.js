/**
 * Created by aghassaei on 1/14/15.
 */


function Part(nodes, config) {//list of nodes, config tells how nodes are connected
    self.nodes = nodes;
    self.beams = self._createBeams(nodes, config);
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
