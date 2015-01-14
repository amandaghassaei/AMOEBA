/Math.pow(, 
 * Created by aghassaei on 1/13/15.
 */


//a single beam, made from two nodes

function Beam(node1, node2) {
    this.nodes = [node1, node2];
    var self = this;
    _.each(nodes, function(node){//give each node a reference to the new beam it is connected to
        node.addBeam(self);
    });
}

Beam.prototype.render = function(scene){

};


BeamNode.prototype.translate = function(dx, dy, dz){
};

Beam.prototype.rotate = function(rx, ry, rz){
};

Beam.prototype.setStiffness = function(scene){

};

Beam.prototype.calcStiffnessMatrix = function(){

    var L = 0;
    var A = 0;
    var Iy = 0;
    var Iz = 0;
    var E = 0;
    var G = 0;

    var K = [
        [A*E/L , 0 , 0 , 0 , 0 , 0 , -A*E/L , 0 , 0 , 0 , 0 , 0] ,//d1x
  		[0 , 12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , 6*E*Iz/Math.pow(L, 2) , 0 , -12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , 6*E*Iz/Math.pow(L, 2)] ,//d1y
  		[0 , 0 , 12*E*Iy/Math.pow(L, 3) , 0 , -6*E*Iy/Math.pow(L, 2) , 0 , 0 , 0 , -12*E*Iy/Math.pow(L, 3) , 0 , -6*E*Iy/Math.pow(L, 2) , 0] ,//d1z
  		[0 , 0 , 0 , G*J/L , 0 , 0 , 0 , 0 , 0 , -G*J/L , 0 , 0] , //r1x
  		[0 , 0 , -6*E*Iy/Math.pow(L, 2) , 0 , 4*E*Iy/L , 0 , 0 , 0 , 6*E*Iy/Math.pow(L, 2) , 0 , 2*E*Iy/L , 0] ,//r1y
  		[0 , 6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 4*E*Iz/L , 0 , -6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 2*E*Iz/L] ,//r1z
  		[-A*E/L , 0 , 0 , 0 , 0 , 0 , A*E/L , 0 , 0 , 0 , 0 , 0] , //d2x
  		[0 , -12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , -6*E*Iz/Math.pow(L, 2) , 0 , 12*E*Iz/Math.pow(L, 3) , 0 , 0 , 0 , -6*E*Iz/Math.pow(L, 2)] ,//d2y
  		[0 , 0 , -12*E*Iy/Math.pow(L, 3) , 0 , 6*E*Iy/Math.pow(L, 2) , 0 , 0 , 0 , 12*E*Iy/Math.pow(L, 3) , 0 , 6*E*Iy/Math.pow(L, 2) , 0] ,//d2z
  		[0 , 0 , 0 , -G*J/L , 0 , 0 , 0 , 0 , 0 , G*J/L , 0 , 0] ,//r2x
  		[0 , 0 , -6*E*Iy/Math.pow(L, 2) , 0 , 2*E*Iy/L , 0 , 0 , 0 , 6*E*Iy/Math.pow(L, 2) , 0 , 4*E*Iy/L , 0] ,//r2y
  		[0 , 6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 2*E*Iz/L , 0 , -6*E*Iz/Math.pow(L, 2) , 0 , 0 , 0 , 4*E*Iz/L]//r2z
  	];

};


