/**
 * Created by aghassaei on 5/26/15.
 */


var unitVertexOcta = new THREE.OctahedronGeometry(1/Math.sqrt(2));

function OctaRotEdgeCell(indices){
    DMACell.call(this, indices);
}
OctaRotEdgeCell.prototype = Object.create(DMACell.prototype);

OctaRotEdgeCell.prototype._initParts = function(){
    return this.changePartType(globals.lattice.get("partType"));
};

OctaRotEdgeCell.prototype.changePartType = function(type){
    var newParts = [];
    if (type == "vox"){
        newParts.push(new OctaEdgeVoxPart(0));
    } else if (type == "voxLowPoly"){
        newParts.push(new OctaEdgeVoxPartLowPoly(0));
    } else {
        console.warn("part type " + type + " not recognized");
        return;
    }
    if (!this.parts) return newParts;
    this.destroyParts();
    this.parts = newParts;
};

OctaRotEdgeCell.prototype._getGeometry = function(){
    return unitVertexOcta;
};

OctaRotEdgeCell.prototype._rotateCell = function(object3D){
    object3D.rotation.set(0, 0, Math.PI/4);
    return object3D;
};

OctaRotEdgeCell.prototype.calcHighlighterPosition = function(face, point){

    var position = this.getPosition();
    var direction = new THREE.Vector3(0,0,0);
    var rad = this.xScale()*Math.sqrt(2)/6;

    var difference = new THREE.Vector3().subVectors(position, point);
    difference.divideScalar(this.zScale());
    if (Math.abs(difference.z) < 0.2){
        direction.z = 0;
    } else if (point.z < position.z) {
        direction.z = -1;
        position.z -= rad;
    } else {
        direction.z = 1;
        position.z += rad;
    }

    if (direction.z != 0){
        if (this.indices.z%2 == 0){
            if (point.x < position.x) {
                direction.x -= 1;
                position.x -= rad;
            }
            else position.x += rad;
            if (point.y < position.y) {
                direction.y -= 1;
                position.y -= rad;
            }
            else position.y += rad;
        } else {
            if (point.x > position.x) {
                direction.x += 1;
                position.x += rad;
            }
            else position.x -= rad;
            if (point.y > position.y) {
                direction.y += 1;
                position.y += rad;
            }
            else position.y -= rad;
        }
    } else {
        if (Math.abs(difference.x) > Math.abs(difference.y)){
            if (point.x > position.x) direction.x = 1;
            else direction.x = -1;
        } else {
            if (point.y > position.y) direction.y = 1;
            else direction.y = -1;
        }
        position.x += direction.x*this.xScale()/2;
        position.y += direction.y*this.yScale()/2;
    }

    return {index: _.clone(this.indices), direction:direction, position:position};
};