/**
 * Created by aghassaei on 5/26/15.
 */


function DMATetraEdgeCell(index, superCell){
    TetraFaceCell.call(this, index, superCell);
}
DMATetraEdgeCell.prototype = Object.create(TetraFaceCell.prototype);

DMATetraEdgeCell.prototype._rotateCell = function(){};