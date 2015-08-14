/**
 * Created by aghassaei on 6/23/15.
 */


define(['lattice', 'three'], function(lattice, THREE){

    var camMethods = {

        showCellAtIndex: function(index){
            var latticeIndex = (new THREE.Vector3()).subVectors(index, this.get("cellsMin"));//index is probably a json object from gcode comment
            var cell = this.cells[latticeIndex.x][latticeIndex.y][latticeIndex.z];
            if (cell) cell.show();
            else console.warn("placing a cell that does not exist");
        },

        rasterCells: function(order, callback, var1, var2, var3, cells){//used for CAM raster x/y/z in any order permutation
            //order is of form 'XYZ'
            var firstLetter = order.charAt(0);
            order = order.substr(1);
            var isNeg = false;
            if (firstLetter == "-") {
                isNeg = true;
                firstLetter = order.charAt(0);
                order = order.substr(1);
            }
            if (!cells) cells = this.sparseCells;//grab cells once at beginning and hold onto it in case changes are made while looping
            var newVarOrder;
            var newVarDim;
            if (firstLetter == 'X'){
                newVarOrder = 0;
                newVarDim = cells.length;
            } else if (firstLetter == 'Y'){
                newVarOrder = 1;
                newVarDim = cells[0].length;
            } else if (firstLetter == 'Z'){
                newVarOrder = 2;
                newVarDim = cells[0][0].length;
            } else if (firstLetter == ""){
                this._rasterCells(order, callback, var1, var2, var3, cells);
                return;
            }
            if (var3 == null) var3 = {order: newVarOrder, dim: newVarDim, neg:isNeg};
            else if (var2  == null) var2 = {order: newVarOrder, dim: newVarDim, neg:isNeg};
            else var1 = {order: newVarOrder, dim: newVarDim, neg:isNeg};
            this.rasterCells(order, callback, var1, var2, var3, cells);
        },

        _rasterCells: function(order, callback, var1, var2, var3, cells){
            for (var i=this._getRasterLoopInit(var1);this._getRasterLoopCondition(i,var1);i+=this._getRasterLoopIterator(var1)){
                for (var j=this._getRasterLoopInit(var2);this._getRasterLoopCondition(j,var2);j+=this._getRasterLoopIterator(var2)){
                    for (var k=this._getRasterLoopInit(var3);this._getRasterLoopCondition(k,var3);k+=this._getRasterLoopIterator(var3)){
                        if (var1.order == 0){
                            if (var2.order == 1) callback(cells[i][j][k], i, j, k);
                            else if (var2.order == 2) callback(cells[i][k][j], i, k, j);
                        } else if (var1.order == 1){
                            if (var2.order == 0) callback(cells[j][i][k], j, i, k);
                            else if (var2.order == 2) callback(cells[k][i][j], k, i, j);
                        } else {
                            if (var2.order == 0) callback(cells[j][k][i], j, k, i);
                            else if (var2.order == 1) {
                                callback(cells[k][j][i], k, j, i);
                            }
                        }

                    }
                }
            }
        },

        _getRasterLoopInit: function(variable){
            if (variable.neg) return variable.dim-1;
            return 0;
        },

        _getRasterLoopCondition: function(iter, variable){
            if (variable.neg) return iter>=0;
            return iter<variable.dim;
        },

        _getRasterLoopIterator: function(variable){
            if (variable.neg) return -1;
            return 1;
        }
    };

    _.extend(lattice, camMethods);

    return lattice;
});