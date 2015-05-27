/**
 * Created by aghassaei on 5/26/15.
 */


function DMATetraEdgeCell(indices, scale, cellMode, partType){
    TetraFaceCell.call(this, indices, scale, cellMode, partType);
}
DMATetraEdgeCell.prototype = Object.create(TetraFaceCell.prototype);

DMATetraEdgeCell.prototype._rotateCell = function(){};