/**
 * Created by aghassaei on 6/1/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    function DMASuperCell(index, material, superCell){//supercells might have supercells

        var range = lattice.get("superCellRange");
        this.cells = this._makeChildCells(index, range);//todo three dimensional array?
        DMACell.call(this, index, superCell);
    
        this.setMode();
    }
    DMASuperCell.prototype = Object.create(DMACell.prototype);

    DMASuperCell.prototype._makeChildCells = function(index, range){
        var cells = [];
        for (var x=0;x<range.x;x++){
            for (var y=0;y<range.y;y++){
                for (var z=0;z<range.z;z++){
                    cells.push(this._makeSubCellForIndex({x:x, y:y, z:z}));//child cells add themselves to object3D
                }
            }
        }
        return cells;
    };

    DMASuperCell.prototype._makeSubCellForIndex = function(index){
        return null;//override in subclasses
    };

    DMASuperCell.prototype._getModeName = function(){
        return "";
    };

    DMASuperCell.prototype.setMode = function(mode){
        DMACell.prototype.setMode.call(mode);
        _.each(this.cells, function(cell){
            cell.setMode(mode);
        });
    };





    DMASuperCell.prototype.getLength = function(){
        if (this.cells) return this.cells.length-1;
        return lattice.get("superCellRange").x-1;
    };

    DMASuperCell.prototype._loopCells = function(callback){
        var cells = this.cells;
        for (var x=0;x<cells.length;x++){
            for (var y=0;y<cells[0].length;y++){
                for (var z=0;z<cells[0][0].length;z++){
                    callback(cells[x][y][z], x, y, z, this);
                }
            }
        }
    };

    DMASuperCell.prototype._iterCells = function(callback){
        var self = this;
        var cells = this.cells;
        _.each(cells, function(cellLayer){
            _.each(cellLayer, function(cellColumn){
                _.each(cellColumn, function(cell){
                    callback(self, cell, cellColumn, cellLayer);
                });
            });

        });
    };

    DMASuperCell.prototype.destroy = function(){
        this._iterCells(function(cell){
            if (cell) cell.destroy();
        });
        this.cells = null;
        DMACell.prototype.destroy.call();
    };

    return DMASuperCell;
});