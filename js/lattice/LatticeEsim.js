/**
 * Created by aghassaei on 6/30/15.
 */

define(['lattice', 'eSim', 'eSimCell'], function(lattice, eSim){

    var eSimMethods = {

        calculateConductorConnectivity: function(){
            var num = 1;
            this._loopCells(this.cells, function(cell){
                if (cell) cell.setConductorGroupNum(num++, true);
            });
            this._loopCells(this.cells, function(cell){
                if (cell) cell.propagateConductorGroupNum();
            });
            this._calcNumberConnectedComponents();
        },

        _calcNumberConnectedComponents: function(){
            var groups = [];
            this._loopCells(this.cells, function(cell){
                if (!cell) return;
                if (groups.indexOf(cell.getConductorGroupNum()) < 0 && cell.isConductive()) groups.push(cell.getConductorGroupNum());
            });
            eSim.set("conductorGroups", _.keys(groups));
        },

        propagateToNeighbors: function(index, callback){
            index.sub(this.get("denseCellsMin"));
            var xLength = this.cells.length;
            var yLength = this.cells[0].length;
            var zLength = this.cells[0][0].length;
            if (index.x+1 < xLength) callback(this.cells[index.x+1][index.y][index.z]);
            if (index.x-1 >= 0) callback(this.cells[index.x-1][index.y][index.z]);
            if (index.y+1 < yLength) callback(this.cells[index.x][index.y+1][index.z]);
            if (index.y-1 >= 0) callback(this.cells[index.x][index.y-1][index.z]);
            if (index.z+1 < zLength) callback(this.cells[index.x][index.y][index.z+1]);
            if (index.z-1 >= 0) callback(this.cells[index.x][index.y][index.z-1]);
        }

    };

    _.extend(lattice, eSimMethods);
    return lattice;
});
