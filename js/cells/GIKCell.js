/**
 * Created by aghassaei on 5/26/15.
 */


(function () {

    function GIKCell(indices){
        this.superCell = true;
        CubeCell.call(this, indices, true);
    }
    GIKCell.prototype = Object.create(CubeCell.prototype);

    GIKCell.prototype.setSuperCell = function(superCell, index){
        this.superCell = superCell;
        this.superCellIndex = index;
        if (this.superCellIndex == this.superCell.getLength()) this.object3D.rotateZ(Math.PI);
    };

    GIKCell.prototype.getMaterialType = function(){
        return this.superCell.getMaterialType();
    };

    GIKCell.prototype._initParts = function(){
        if (!this.superCell) return [];
        var parts  = [];
        var isEnd = this.superCellIndex == 0 || this.superCellIndex == this.superCell.getLength();
        if (globals.lattice.get("partType") == "lego") {
            if (isEnd) parts.push(new DMAGIKEndPart(0, this));
            else parts.push(new DMAGIKPart(0, this));
        }
        else {
            if (isEnd) parts.push(new DMAGIKEndPartLowPoly(0, this));
            else parts.push(new DMAGIKPartLowPoly(0, this));
        }
        return parts;
    };

    self.GIKCell = GIKCell;

})();