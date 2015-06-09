/**
 * Created by aghassaei on 6/1/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    function DMASuperCell(index, superCell){//supercells might have supercells

        DMACell.call(this, index, superCell);

        var range = appState.get("superCellRange");
        this.cells = this._makeChildCells(range, this.getMaterial());
    
        this.setMode();
    }
    DMASuperCell.prototype = Object.create(DMACell.prototype);

    DMASuperCell.prototype._makeChildCells = function(range, material){
        var cells = [];
        for (var x=0;x<range.x;x++){
            cells.push([]);
            for (var y=0;y<range.y;y++){
                cells[x].push([]);
                for (var z=0;z<range.z;z++){
                    //child cells add themselves to object3D
                    if (material.cells && material.cells[x][y][z]) cells[x][y].push(this._makeSubCellForIndex(new THREE.Vector3(x, y, z), this, material.cells[x][y][z].material));
                    else cells[x][y].push(this._makeSubCellForIndex(new THREE.Vector3(x, y, z), this, material));
                }
            }
        }
        return cells;
    };

    DMASuperCell.prototype._makeSubCellForIndex = function(index, material){
        return null;//override in subclasses
    };

    DMASuperCell.prototype._getMeshName = function(){
        return "supercell";
    };

    DMASuperCell.prototype.setMode = function(mode){
        DMACell.prototype.setMode.call(this, mode);
        this._loopCells(function(cell){
            if (cell) cell.setMode(mode);
        });
    };





    DMASuperCell.prototype.getLength = function(){
        if (this.cells) return this.cells.length-1;
        return appState.get("superCellRange").x-1;//zero indexed
    };

    DMASuperCell.prototype._loopCells = function(callback){
        var cells = this.cells;
        if (!cells || cells === undefined) return;
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