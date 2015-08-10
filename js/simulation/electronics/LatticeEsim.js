/**
 * Created by aghassaei on 6/30/15.
 */

define(['lattice', 'appState', 'three', 'threeModel', 'eSim', 'eSimCell', 'eSimSuperCell'],
    function(lattice, appState, THREE, three, eSim){



    var eSimMethods = {

        _eSimTabChanged: function(){
            var currentTab = appState.get("currentTab");
            if (currentTab == "eSetup" || currentTab == "eStatic") this._showConductors();
            else this.setOpaque();
        },

        _showConductors: function(){
            var groupNum = eSim.get("visibleConductorGroup");
            if (!eSim.get("conductorGroups") || eSim.get("conductorGroups").length == 0 || groupNum == -2){
                this.setOpaque();
                three.render();
                return;
            }
            var allVisible = groupNum == -1;
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
                if (_.filter(groups, function(group){
                    return group.id == cell.getConductorGroupNum();
                }).length == 0 && cell.isConductive()) {
                    groups.push({id:cell.getConductorGroupNum(), current: null, voltage: null});
                }
            });
            eSim.set("conductorGroups", groups);
        },

        propagateToNeighbors: function(index, callback){
            index.sub(this.get("denseCellsMin"));
            var xLength = this.cells.length;
            var yLength = this.cells[0].length;
            var zLength = this.cells[0][0].length;
            if (index.z+1 < zLength) callback(this.cells[index.x][index.y][index.z+1]);
            if (index.z-1 >= 0) callback(this.cells[index.x][index.y][index.z-1]);
            if (this.get("connectionType") == "gik") return;
            if (index.x+1 < xLength) callback(this.cells[index.x+1][index.y][index.z]);
            if (index.x-1 >= 0) callback(this.cells[index.x-1][index.y][index.z]);
            if (index.y+1 < yLength) callback(this.cells[index.x][index.y+1][index.z]);
            if (index.y-1 >= 0) callback(this.cells[index.x][index.y-1][index.z]);
        },

        calcEField: function(conductorGroups, resolution){

            if (this.numCells == 0){
                console.warn("no cells!");
                return;
            }

            var eFieldMat = [];
            //init size of field mat and fill with zeros, +2 puts a shell of zeros at boundary (infinity)
            for (var x=0;x<resolution*this.cells.length+2;x++){
                eFieldMat.push([]);
                for (var y=0;y<resolution*this.cells[0].length+2;y++){
                    eFieldMat[x].push([]);
                    for (var z=0;z<resolution*this.cells[0][0].length+2;z++){
                        eFieldMat[x][y].push(0);
                    }
                }
            }

            //input conductor potentials
            this._loopCells(this.cells, function(cell, x, y, z){
                if (!cell) return;
                for (var i=0;i<resolution;i++){
                    for (var j=0;j<resolution;j++){
                        for (var k=0;k<resolution;k++){
                            if (cell) eFieldMat[x+i+1][y+j+1][z+k+1] = 1;
                        }
                    }
                }
            });
            console.log(eFieldMat);

            console.log(this.get("cellsMin"));
            var offset = this.get("cellsMin").clone().sub(new THREE.Vector3(1/(2*resolution)+this.xScale(0)/2, 1/(2*resolution)+this.yScale(0)/2, 1/(2*resolution)+this.zScale(0)/2));
            console.log(offset);
            require(['eSimField'], function(ESimField){
                eSim.set("electricField", new ESimField(eFieldMat, offset, resolution));
            });

        },

        calcCapacitance: function(){

        },

        calcInductance: function(){

        }

    };

    _.extend(lattice, eSimMethods);
    lattice.listenTo(appState, "change:currentTab", lattice._eSimTabChanged);
    lattice.listenTo(eSim, "change:visibleConductorGroup", lattice._showConductors);
    lattice._showConductors();


    return lattice;
});
