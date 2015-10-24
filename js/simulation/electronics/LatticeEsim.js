/**
 * Created by aghassaei on 6/30/15.
 */

define(['lattice', 'appState', 'three', 'threeModel', 'numeric', 'eSim', 'eSimField', 'eSimCell', 'eSimSuperCell'],
    function(lattice, appState, THREE, three, numeric, eSim, ESimField){



    var eSimMethods = {

        _eSimTabChanged: function(){
            var currentTab = appState.get("currentTab");
            if (currentTab == "eSetup" || currentTab == "eStatic") this._showConductors();
            else this.setOpaque();
        },

        _showConductors: function(){
            var groupNum = eSim.get("visibleConductorGroup");
            if (!eSim.get("conductorGroups") || _.keys(eSim.get("conductorGroups")).length == 0 || groupNum == -2){
                this.setOpaque();
                three.render();
                return;
            }
            var allVisible = groupNum == -1;
            this._loopCells(this.sparseCells, function(cell){
                if (cell) cell.setTransparentByEval(function(evalCell){
                    return !(evalCell.conductiveGroupVisible(allVisible, groupNum));
                });
            });
            three.render();
        },

        _showStructure: function(){
            var groupNum = eSim.get("visibleStructuralGroup");
            if (!eSim.get("structuralGroups") || _.keys(eSim.get("structuralGroups")).length == 0 || groupNum == -1){
                this.setOpaque();
                three.render();
                return;
            }
            var allVisible = groupNum == -1;
            this._loopCells(this.sparseCells, function(cell){
                if (cell) cell.setTransparentByEval(function(evalCell){
                    return !(allVisible || evalCell.structuralGroupVisible(groupNum));
                });
            });
            three.render();
        },

        calculateStructuralConnectivity: function(){
            var num = 1;
            this._loopCells(this.cells, function(cell){
                if (cell) cell.setStructuralGroupNum(num++, true);
            });
            this._loopCells(this.cells, function(cell){
                if (cell) cell.propagateStructuralGroupNum();
            });
            this._calcNumberStructurallyConnectedComponents();
            this._showConductors();
        },

        _calcNumberStructurallyConnectedComponents: function(){
            var groups = {};
            this._loopCells(this.cells, function(cell){
                if (!cell) return;
                if (_.filter(groups, function(group){
                    return group.id == cell.getStructuralGroupNum();
                }).length == 0) {
                    groups[cell.getStructuralGroupNum()] = {};
                }
            });
            eSim.set("structuralGroups", groups);
        },

        calculateConductorConnectivity: function(){
            var num = 1;
            this._loopCells(this.cells, function(cell){
                if (cell) cell.setConductorGroupNum(num++, true);
            });
            this._loopCells(this.cells, function(cell){
                if (cell) cell.propagateConductorGroupNum();
            });
            this._calcNumberDCConnectedComponents();
            this._showConductors();
        },

        _calcNumberDCConnectedComponents: function(){
            var groups = {};
            this._loopCells(this.cells, function(cell){
                if (!cell) return;
                if (_.filter(groups, function(group){
                    return group.id == cell.getConductorGroupNum();
                }).length == 0 && cell.isConductive()) {
                    groups[cell.getConductorGroupNum()] = {current: null, voltage: null};
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

        calcEField: function(conductorGroups, resolution, numRelaxationSteps){

            if (this.numCells == 0){
                console.warn("no cells!");
                return;
            }

            var potentialMat = [];
            //init size of field mat and fill with zeros, +2 puts a shell of zeros at boundary (infinity)
            for (var x=0;x<resolution*this.cells.length+2;x++){
                potentialMat.push([]);
                for (var y=0;y<resolution*this.cells[0].length+2;y++){
                    potentialMat[x].push([]);
                    for (var z=0;z<resolution*this.cells[0][0].length+2;z++){
                        potentialMat[x][y].push(0);
                    }
                }
            }

            //input conductor potentials
            this._loopCells(this.cells, function(cell, x, y, z){
                if (!cell) return;
                for (var i=0;i<resolution;i++){
                    for (var j=0;j<resolution;j++){
                        for (var k=0;k<resolution;k++){
                            if (cell && conductorGroups[cell.getConductorGroupNum()]) {
                                potentialMat[resolution*x+i+1][resolution*y+j+1][resolution*z+k+1] =
                                    conductorGroups[cell.getConductorGroupNum()].voltage;
                            }
                        }
                    }
                }
            });

            var offset = this.get("cellsMin").clone().sub(new THREE.Vector3(1/(2*resolution)+this.xScale()/2, 1/(2*resolution)+this.yScale()/2, 1/(2*resolution)+this.zScale()/2));
            var dataRange = [];
            _.each(conductorGroups, function(group){
                dataRange.push(group.voltage);
            });


            //create raw potential field
            var potentialData = numeric.clone(potentialMat);
            if (eSim.get("rawPotentialField")){
                eSim.get("rawPotentialField").setData(potentialData, offset, resolution, eSim.get("simZHeight"), dataRange);
            } else {
                eSim.set("rawPotentialField", new ESimField(potentialData, offset, resolution, eSim.get("simZHeight"), dataRange));
            }
            eSim.set("visibleStaticSim", "rawPotentialField");//will cause render


            for (var i=0;i<numRelaxationSteps;i++){
                var temp = numeric.clone(potentialMat);
                for (var x=0;x<temp.length;x++){
                    for (var y=0;y<temp[x].length;y++){
                        for (var z=0;z<temp[x][y].length;z++){
                            if (potentialData[x][y][z] != 0) continue;//todo fix this for 0V
                            var avg = 0;
                            if (x > 0) avg += potentialMat[x-1][y][z];
                            if (x < temp.length-1) avg += potentialMat[x+1][y][z];
                            if (y > 0) avg += potentialMat[x][y-1][z];
                            if (y < temp[x].length-1) avg += potentialMat[x][y+1][z];
                            if (z > 0) avg += potentialMat[x][y][z-1];
                            if (z < temp[x][y].length-1) avg += potentialMat[x][y][z+1];
                            temp[x][y][z] = avg/6.0;
                        }
                    }
                }
                potentialMat = temp;
                console.log("hi");
            }

            //create potential field
            if (eSim.get("potentialField")){
                eSim.get("potentialField").setData(potentialMat, offset, resolution, eSim.get("simZHeight"), dataRange);
            } else {
                eSim.set("potentialField", new ESimField(potentialMat, offset, resolution, eSim.get("simZHeight"), dataRange));
            }
            eSim.set("visibleStaticSim", "potentialField");//will cause render


            //create electric field
            var eFieldMat = numeric.clone(potentialMat);
            for (var x=0;x<eFieldMat.length-1;x++){
                for (var y=0;y<eFieldMat[x].length-1;y++){
                    for (var z=0;z<eFieldMat[x][y].length-1;z++){
                        var currentVal = eFieldMat[x][y][z];
                        eFieldMat[x][y][z] = Math.sqrt(Math.pow(eFieldMat[x+1][y][z]-currentVal, 2) + Math.pow(eFieldMat[x][y+1][z]-currentVal, 2) + Math.pow(eFieldMat[x][y][z+1]-currentVal, 2))
                    }
                }
            }
            if (eSim.get("electricField")){
                eSim.get("electricField").setData(eFieldMat, offset, resolution, eSim.get("simZHeight"), dataRange);
            } else {
                eSim.set("electricField", new ESimField(eFieldMat, offset, resolution, eSim.get("simZHeight"), dataRange));
            }
//            eSim.set("visibleStaticSim", "electricField");//will cause render


            //create charge distribution
            var chargeMat = numeric.clone(potentialMat);
            for (var x=0;x<eFieldMat.length-1;x++){
                for (var y=0;y<eFieldMat[x].length-1;y++){
                    for (var z=0;z<eFieldMat[x][y].length-1;z++){
                        var sum = 0;
                        if (x > 0) sum += potentialMat[x-1][y][z];
                        if (x < temp.length-1) sum += potentialMat[x+1][y][z];
                        if (y > 0) sum += potentialMat[x][y-1][z];
                        if (y < temp[x].length-1) sum += potentialMat[x][y+1][z];
                        if (z > 0) sum += potentialMat[x][y][z-1];
                        if (z < temp[x][y].length-1) sum += potentialMat[x][y][z+1];
                        chargeMat[x][y][z] = 10*(sum + 6*eFieldMat[x][y][z]);
                    }
                }
            }
            if (eSim.get("chargeField")){
                eSim.get("chargeField").setData(chargeMat, offset, resolution, eSim.get("simZHeight"), dataRange);
            } else {
                eSim.set("chargeField", new ESimField(chargeMat, offset, resolution, eSim.get("simZHeight"), dataRange));
            }
//            eSim.set("visibleStaticSim", "chargeField");//will cause render

        },

        calcCapacitance: function(){

        },

        calcInductance: function(){

        }

    };

    _.extend(lattice, eSimMethods);
    lattice.listenTo(appState, "change:currentTab", lattice._eSimTabChanged);
    lattice.listenTo(eSim, "change:visibleConductorGroup", lattice._showConductors);
    lattice.listenTo(eSim, "change:visibleStructuralGroup", lattice._showStructure);
    lattice._showConductors();


    return lattice;
});
