/**
 * Created by aghassaei on 5/26/15.
 */


(function () {

    function GIKCell(indices, cellMode, partType){
        CubeCell.call(this, indices, cellMode, partType);
    }
    GIKCell.prototype = Object.create(CubeCell.prototype);

    GIKCell.prototype._buildMesh = function(){
        return DMACubeCell.prototype._buildMesh.call(this, cellMaterial);
    };

    GIKCell.prototype._doMeshTransformations = function(mesh){
        if (this.indices && this.indices.z%2 != 0) mesh.rotateZ(Math.PI/2);
    };

    GIKCell.prototype._setCellMeshVisibility = function(visible){
        this.mesh.visible = false;
        if (this.superCell) this.superCell.setVisibility(visible);
    };

    GIKCell.prototype.setSuperCell = function(superCell, index){
        this.superCell = superCell;
        this.superCellIndex = index;
        if (this.superCellIndex == this.superCell.getLength()) this.mesh.rotateZ(Math.PI);
        if (globals.appState.get("cellMode")=="part") {
            this.parts = this.__initParts();
            this.draw();
        }
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