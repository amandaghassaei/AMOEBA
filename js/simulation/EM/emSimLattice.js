/**
 * Created by aghassaei on 1/11/16.
 */


define(['underscore', 'backbone', 'emSimCell'], function(_, Backbone, EMSimCell){


    var EMSimLattice = Backbone.Model.extend({

        defaults: {

        },

        initialize: function(){

        },

        setCells: function(cells){
            this.destroyCells();
            this.cells = this._initEmptyArray(cells);
            this._loopCells(cells, function(cell, x, y, z, self){
                self.cells[x][y][z] = new EMSimCell(cell);
            });
        },

        _initEmptyArray: function(cells){
            var array3D = [];
            for (var x=0;x<cells.length;x++){
                var array2D = [];
                for (var y=0;y<cells[0].length;y++){
                    var array1D = [];
                    for (var z=0;z<cells[0][0].length;z++){
                        array1D.push(null);
                    }
                    array2D.push(array1D);
                }
                array3D.push(array2D);
            }
            return array3D;
        },

        destroyCells: function(){
            if (this.cells){
                this._loopCells(this.cells, function(cell){
                    cell.destroy();
                });
            }
        },

        _loopCells: function(cells, callback){
            for (var x=0;x<cells.length;x++){
                for (var y=0;y<cells[0].length;y++){
                    for (var z=0;z<cells[0][0].length;z++){
                        if (cells[x][y][z]) callback(cells[x][y][z], x, y, z, this);
                    }
                }
            }
        },

        _loopCellsWithNeighbors: function(callback){
            var cells = this.cells;
            if (!cells) {
                console.warn('no cells array');
                return;
            }
            var sizeX = cells.length;
            var sizeY = cells[0].length;
            var sizeZ = cells[0][0].length;
            this._loopCells(cells, function(cell, x, y, z, self){

                var neighbors = [];
                if (x == 0) neighbors.push(null);
                else neighbors.push(cells[x-1][y][z]);
                if (x == sizeX-1) neighbors.push(null);
                else neighbors.push(cells[x+1][y][z]);

                if (y == 0) neighbors.push(null);
                else neighbors.push(cells[x][y-1][z]);
                if (y == sizeY-1) neighbors.push(null);
                else neighbors.push(cells[x][y+1][z]);

                if (z == 0) neighbors.push(null);
                else neighbors.push(cells[x][y][z-1]);
                if (z == sizeZ-1) neighbors.push(null);
                else neighbors.push(cells[x][y][z+1]);

                callback(cell, neighbors, x, y, z, self);
            });
        },

        iter: function(){
            this._loopCellsWithNeighbors(function(cell, neighbors){
                console.log(neighbors);
            });
        },

        reset: function(){
            console.warn("do something here");
        }


    });


    return new EMSimLattice();

});