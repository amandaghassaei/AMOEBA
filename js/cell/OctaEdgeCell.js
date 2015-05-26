/**
 * Created by aghassaei on 5/26/15.
 */


function OctaEdgeCell(indices){
    OctaFaceCell.call(this, indices);
}
OctaEdgeCell.prototype = Object.create(OctaFaceCell.prototype);

OctaEdgeCell.prototype._rotateCell = function(object3D){
    return object3D;
};

//todo fix this
OctaEdgeCell.prototype.calcHighlighterPosition = function(face){
    var direction = face.normal.clone();
    direction.applyQuaternion(this.mesh.quaternion);
    var position = this.getPosition();
    position.add(direction.clone().multiplyScalar(this.zScale()/2));
    return {index: _.clone(this.indices), direction:direction, position:position};
};