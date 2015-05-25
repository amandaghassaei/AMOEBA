/**
 * Created by aghassaei on 3/10/15.
 */


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////CUBE LATTICE//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

OtherLatticeSubclasses = {

    CubeLattice: {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane({scale:this.get("scale")});
            globals.highlighter = new CubeHighlighter({scale:this.get("scale")});
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMACubeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.CubeLattice), function(key){
                self[key] = null;
            });
        }
    },

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////GIK LATTICE//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    GIKLattice: {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane({scale:this.get("scale")});
            globals.highlighter = new GIKHighlighter({scale:this.get("scale")});
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return 1.28*scale*(1+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMAGIKCell(indices, scale);
        },

        makeSuperCell: function(range){
            var length = this.get("gikLength");
            var cells;
            if (range) cells = this.addCellsInRange(range);
            else {
                cells = [];
                var scale = this.get("scale");
                for (var i=0;i<length;i++){
                    cells.push(this.makeCellForLatticeType(null, scale));
                }
            }
            if (cells.length < 1) return null;
            var superCell = new DMASuperCell(length, range, cells);
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
    },


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////TRUNCATED CUBE LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    TruncatedCubeLattice: {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane({scale:this.get("scale")});
            globals.highlighter = new TruncatedCubeHighlighter({scale:this.get("scale")});
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(Math.sqrt(2)+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(Math.sqrt(2)+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMATruncCubeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.TruncatedCubeLattice), function(key){
                self[key] = null;
            });
        }

    },


    ////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////TRUNCATED CUBE LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    KelvinLattice: {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane({scale:this.get("scale")});
            globals.highlighter = new TruncatedCubeHighlighter({scale:this.get("scale")});
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(2*Math.sqrt(2)+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(2*Math.sqrt(2)+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMATruncOctaCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.KelvinLattice), function(key){
                self[key] = null;
            });
        }

    }

};