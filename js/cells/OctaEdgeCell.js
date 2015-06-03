/**
 * Created by aghassaei on 5/26/15.
 */


define(['octaFaceCell'], function(OctaFaceCell){

    function OctaEdgeCell(index, superCell){
        OctaFaceCell.call(this, index, superCell);
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
        return {index: _.clone(this.index), direction:direction, position:position};
    };

    return OctaEdgeCell;
});