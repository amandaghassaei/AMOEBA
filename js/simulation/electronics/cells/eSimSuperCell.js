/**
 * Created by aghassaei on 7/2/15.
 */


define(['underscore', 'superCell'], function(_, DMASuperCell){

    DMASuperCell.prototype.conductiveGroupVisible = function(allVisible, groupNum){
        if (allVisible) return this.isConductive();
        for (var i=0;i<this.sparseCells.length;i++){
            for (var j=0;j<this.sparseCells[0].length;j++){
                for (var k=0;k<this.sparseCells[0][0].length;k++){
                    if (this.sparseCells[i][j][k] && this.sparseCells[i][j][k].conductiveGroupVisible(allVisible, groupNum)) return true;
                }
            }
        }
        return false;
    };

    DMASuperCell.prototype.structuralGroupVisible = function(groupNum){
        for (var i=0;i<this.sparseCells.length;i++){
            for (var j=0;j<this.sparseCells[0].length;j++){
                for (var k=0;k<this.sparseCells[0][0].length;k++){
                    if (this.sparseCells[i][j][k] && this.sparseCells[i][j][k].structuralGroupVisible(groupNum)) return true;
                }
            }
        }
        return false;
    };

    return DMASuperCell;
});