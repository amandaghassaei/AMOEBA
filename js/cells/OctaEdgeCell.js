/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'octaFaceCell'],
    function(_, THREE, three, lattice, appState, OctaFaceCell){

    function OctaEdgeCell(json, superCell){
        OctaFaceCell.call(this, json, superCell);
    }
    OctaEdgeCell.prototype = Object.create(OctaFaceCell.prototype);

    OctaFaceCell.prototype._rotateCell = function(object3D){
        return object3D;
    };

    OctaEdgeCell.prototype.calcHighlighterParams = function(face, point){
        var direction = face.normal.clone().applyQuaternion(this.getAbsoluteOrientation());
        var position = this.getAbsolutePosition();
        position.add(direction.clone().multiplyScalar(this.zScale()/2));
        return {index: _.clone(this.index), direction:direction, position:position};
    };

    return OctaEdgeCell;
});