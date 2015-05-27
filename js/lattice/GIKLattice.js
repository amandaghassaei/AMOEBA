/**
 * Created by aghassaei on 5/26/15.
 */

latticeSubclasses = latticeSubclasses || {};

latticeSubclasses["GIKLattice"] = {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane();
            globals.highlighter = new GIKHighlighter();
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return 1+2*cellSeparation;
        },

        yScale: function(cellSeparation){
            return this.xScale(cellSeparation);
        },

        zScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
            return 1.28*(1+2*cellSeparation);
        },

        makeCellForLatticeType: function(indices){
            return new GIKCell(indices);
        },

        makeSuperCell: function(range){
            var length = this.get("gikLength");
            var cells;
            if (range) cells = this.addCellsInRange(range);
            else {
                cells = [];
                for (var i=0;i<length;i++){
                    cells.push(this.makeCellForLatticeType(null));
                }
            }
            if (cells.length < 1) return null;
            var superCell = new GIKSuperCell(length, range, cells);
            _.each(cells, function(cell, index){
                cell.setSuperCell(superCell, index);
            });
            return superCell;
        },

        _rasterGikCells: function(order, callback, var1, var2, var3, cells){
            for (var i=this._getRasterLoopInit(var1);this._getRasterLoopCondition(i,var1);i+=this._getRasterLoopIterator(var1)){
                for (var j=this._getRasterLoopInit(var2);this._getRasterLoopCondition(j,var2);j+=this._getRasterLoopIterator(var2)){
                    for (var k=this._getRasterLoopInit(var3);this._getRasterLoopCondition(k,var3);k+=this._getRasterLoopIterator(var3)){
                        var numToSkip = {x:0,y:0};
                        if (var1.order == 0){
                            if (var2.order == 1) numToSkip = this._doSuperCellCallback(cells, i, j, k, callback);
                            else if (var2.order == 2) numToSkip = this._doSuperCellCallback(cells, i, k, j, callback);
                        } else if (var1.order == 1){
                            if (var2.order == 0) numToSkip = this._doSuperCellCallback(cells, j, i, k, callback);
                            else if (var2.order == 2) numToSkip = this._doSuperCellCallback(cells, k, i, j, callback);
                        } else {
                            if (var2.order == 0) {
                                numToSkip = this._doSuperCellCallback(cells, j, k, i, callback);
                            }
                            else if (var2.order == 1) {
                                numToSkip = this._doSuperCellCallback(cells, k, j, i, callback);
                            }
                        }

                    }
                }
            }
        },

        _doSuperCellCallback: function(cells, x, y, z, callback){
            var cell = cells[x][y][z];
            if (z%2 != 0) cell = cells[y][x][z];
            if (!cell) {
                callback(null, x, y, z);
                return {x:0,y:0};
            }
            var superCell = cell.superCell;
            callback(superCell, x, y, z);
            if (z%2 != 0) return {x:0, y:superCell.getLength()};
            return {x:superCell.getLength(), y:0};
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.GIKLattice), function(key){
                self[key] = null;
            });
        }
    }
