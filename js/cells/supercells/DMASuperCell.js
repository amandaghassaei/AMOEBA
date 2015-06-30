/**
 * Created by aghassaei on 6/1/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    function DMASuperCell(json, superCell){//supercells might have supercells

        this.cells = true;//flag for now

        DMACell.call(this, json, superCell);

        var range;
        var material = this.getMaterial();
        if (material.cellsMax) range = (new THREE.Vector3(1,1,1)).add(material.cellsMax).sub(material.cellsMin);
        else range = this._getSuperCellRange();
        this.cells = this._makeChildCells(range, material);

        DMACell.prototype.setMode.call(this, null, function(){
            three.conditionalRender();
        });//don't pass a call down to children again
    }
    DMASuperCell.prototype = Object.create(DMACell.prototype);

    DMASuperCell.prototype._getSuperCellRange = function(){//override in gik super cell
        return appState.get("superCellRange").clone();
    };

    DMASuperCell.prototype._makeChildCells = function(range, material){
        var cells = [];
        for (var x=0;x<range.x;x++){
            cells.push([]);
            for (var y=0;y<range.y;y++){
                cells[x].push([]);
                for (var z=0;z<range.z;z++){
                    //child cells add themselves to object3D

                    cells[x][y].push(null);

                    var json = {index: new THREE.Vector3(x, y, z)};
                    var callback = function(cell){
                        var cellIndex = cell.getIndex();
                        if (material.cellsMin) cellIndex.sub(material.cellsMin);
                        cells[cellIndex.x][cellIndex.y][cellIndex.z] = cell;
                    };

                    if (material.sparseCells){
                        if (material.sparseCells[x][y][z]){
                            json.index.add(material.cellsMin);
                            json = _.extend(json, material.sparseCells[x][y][z]);
                            this._makeSubCellForIndex(json, callback);
                        }//else no cell in this spot
                    } else {//if not from composite definition, add subcell at all possible indices in supercell range
                        this._makeSubCellForIndex(json, callback);
                    }
                }
            }
        }
        return cells;
    };

    DMASuperCell.prototype._makeSubCellForIndex = function(json, callback){
        var subclassFile = lattice.getCellSubclassFile();
        if (json.materialName && json.materialName.substr(0,5) == "super") subclassFile = "compositeCell";
        var self = this;
        require([subclassFile], function(CellSubclass){
            var cell = new CellSubclass(json, self);
            if (callback) callback(cell);
        });
    };

    DMASuperCell.prototype._getMeshName = function(){
        return "supercell";
    };

    DMASuperCell.prototype.setMode = function(mode, callback){
        var self = this;
        DMACell.prototype.setMode.call(this, mode, function(){
            var numChildren = _.filter(self.object3D.children, function(child){
                return child.name == "object3D";
            }).length;//todo this is weird
            self._loopCells(function(cell){
                if (cell) cell.setMode(mode, function(){
                    if (--numChildren <= 0) {
                        if (callback) {
                            callback();
                            return;
                        }
                        three.conditionalRender();
                    }
                });
            });
        });

    };

    DMASuperCell.prototype._isMiddleLayer = function(){
        return this.superCell !== null && this.superCell !== undefined;
    };

    DMASuperCell.prototype._isTopLayerCell = function(){
        return false;
    };





     //parse
    DMASuperCell.prototype.addToDenseArray = function(cellsArray, min){
        this._loopCells(function(cell){
            if (cell) cell.addToDenseArray(cellsArray, min);
        });
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
        var cells = this.cells;
        _.each(cells, function(cellLayer){
            _.each(cellLayer, function(cellColumn){
                _.each(cellColumn, function(cell){
                    callback(cell, cellColumn, cellLayer);
                });
            });
        });
    };

    DMASuperCell.prototype.destroy = function(){
        this._iterCells(function(cell){
            if (cell) {
                cell.destroy();
                cell = null;
            }
        });
        DMACell.prototype.destroy.call(this);
        this.cells = null;
    };

    DMASuperCell.prototype.destroyParts = function(){
        this._loopCells(function(cell){
            if (cell) cell.destroyParts();
        });
    };

    return DMASuperCell;
});