/**
 * Created by aghassaei on 7/2/15.
 */


define(['underscore', 'superCell'], function(_, DMASuperCell){

    DMASuperCell.prototype.conductiveGroupVisible = function(allVisible, groupNum){
        if (allVisible) return this.isConductive();
        for (var i=0;i<this.cells.length;i++){
            for (var j=0;j<this.cells[0].length;j++){
                for (var k=0;j<this.cells[0][0].length;k++){
                    console.log("here");
                    if (this.cells[i][j[k]] && this.cells[i][j][k].conductiveGroupVisible(allVisible, groupNum)) return true;
                }
            }
        }
        return false;
    };

    return DMASuperCell;
});