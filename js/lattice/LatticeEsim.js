/**
 * Created by aghassaei on 6/30/15.
 */

define(['lattice', 'appState', 'threeModel', 'eSim', 'eSimCell', 'eSimSuperCell'], function(lattice, appState, three, eSim){



    var eSimMethods = {

        _eSimTabChanged: function(){
            var currentTab = appState.get("currentTab");
            if (currentTab == "eSetup") this._showConductors();
            else this.setOpaque();
        },

        _showConductors: function(){
            if (!eSim.get("conductorGroups") || eSim.get("conductorGroups").length == 0){
                this.setOpaque();
                three.render();
                return;
            }
            var groupNum = eSim.get("visibleConductorGroup");
            var allVisible = groupNum < 0;
            this._loopCells(this.sparseCells, function(cell){
                if (cell) cell.setTransparent(function(evalCell){
                    return !(evalCell.conductiveGroupVisible(allVisible, groupNum));
                });
            });
            three.render();
        },

        calculateConductorConnectivity: function(){
            var num = 1;
            this._loopCells(this.cells, function(cell){
                if (cell) cell.setConductorGroupNum(num++, true);
            });
            this._loopCells(this.cells, function(cell){
                if (cell) cell.propagateConductorGroupNum();
            });
            this._calcNumberConnectedComponents();
            this._showConductors();
        },

        _calcNumberConnectedComponents: function(){
            var groups = [];
            this._loopCells(this.cells, function(cell){
                if (!cell) return;
                if (groups.indexOf(cell.getConductorGroupNum()) < 0 && cell.isConductive()) groups.push(cell.getConductorGroupNum());
            });
            eSim.set("conductorGroups", groups);
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
    lattice.listenTo(appState, "change:currentTab", lattice._eSimTabChanged);
    lattice.listenTo(eSim, "change:visibleConductorGroup", lattice._showConductors);
    lattice._showConductors();


    return lattice;
});
