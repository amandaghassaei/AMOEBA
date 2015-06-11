/**
 * Created by aghassaei on 1/16/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, globals, plist, THREE, three){

    var Lattice = Backbone.Model.extend({

        defaults: {

            units: "mm",

            nodes: [],
            cellsMin: null,//min position of cells matrix
            cellsMax: null,//max position of cells matrix
            numCells: 0,

            //spacing for connectors/joints
            cellSeparation: {xy:0, z:0},

            cellType: "cube",
            connectionType: "face",
            partType: null,
            materialType: null,
            materialClass: "mechanical"
        },

        initialize: function(){

            this.cells = [[[null]]];//3D matrix containing all cells and null, dynamic size
            this.sparseCells = [[[null]]];//3D matrix containing highest hierarchical level of cells and null

            //bind events
            this.listenTo(this, "change:partType", this._updatePartType);
            this.listenTo(this, "change:cellType change:connectionType", function(){
                this._updateLatticeType(false);
            });
            this.listenTo(this, "change:cellSeparation", this._updateCellSeparation);

            this.listenTo(appState, "change:cellMode", this._updateForMode);
            this.listenTo(appState, "change:cellsVisible", this._setCellVisibility);

            this.listenTo(this, "change:materialClass", this._loadMaterialClass);

            this.listenTo(appState, "change:currentNav", this._navChanged);

            this._updateLatticeType(false);

            appState.setLattice(this);
        },





        //add/remove cells

        addCellsInRange: function(range){//add a block of cells (extrude)
            this.checkForMatrixExpansion(this.sparseCells, range.max, range.min);

            var cellsMin = this.get("cellsMin");
            var relativeMin = (new THREE.Vector3()).subVectors(range.min, cellsMin);
            var relativeMax = (new THREE.Vector3()).subVectors(range.max, this.get("cellsMin"));

            for (var x=relativeMin.x;x<=relativeMax.x;x++){
                for (var y=relativeMin.y;y<=relativeMax.y;y++){
                    for (var z=relativeMin.z;z<=relativeMax.z;z++){
                        if (!this.sparseCells[x][y][z]) {
                            var self = this;
                             this.makeCellForLatticeType((new THREE.Vector3(x, y, z)).add(cellsMin), function(cell){
                                self.sparseCells[x][y][z] = cell;
                                self.set("numCells", self.get("numCells")+1);
                            });
                        } else console.warn("already a cell there");
                    }
                }
            }
            three.render();
        },

        addCellAtIndex: function(indices, noRender, noCheck){//no render no check from fill

            if (!noCheck || noCheck === undefined) this.checkForMatrixExpansion(this.sparseCells, indices, indices);

            var index = (new THREE.Vector3()).subVectors(indices, this.get("cellsMin") || indices);
            if (!this.sparseCells[index.x][index.y][index.z]) {
                var self = this;
                if (!noRender || noRender === undefined) three.setRenderFlag();
                this.makeCellForLatticeType(indices, function(cell){
                    self.sparseCells[index.x][index.y][index.z] = cell;
                    self.set("numCells", self.get("numCells")+1);
                });
            } else console.warn("already a cell there");

        },

        _indexForPosition: function(absPosition){
            return new THREE.Vector3(
                Math.round(absPosition.x/this.xScale()),
                Math.round(absPosition.y/this.yScale()),
                Math.round(absPosition.z/this.zScale()));
        },

        _positionForIndex: function(index){
            var position = index.clone();
            position.x = (position.x)*this.xScale();
            position.y = (position.y)*this.yScale();
            position.z = (position.z)*this.zScale();
            return position;
        },

    //    removeCellAtIndex: function(indices){
    //
    //        var index = this._subtract(indices, this.get("cellsMin"));
    //        var cells = this.get("cells");
    //        if (index.x<cells.length && index.y<cells[0].length && index.z<cells[0][0].length){
    //            this.removeCell(cells[index.x][index.y][index.z]);
    //        }
    //    },

        removeCell: function(cell){
            if (!cell) return;
            var index = (new THREE.Vector3()).subVectors(cell.index, this.get("cellsMin"));
            cell.destroy();
            this.sparseCells[index.x][index.y][index.z] = null;

            //todo shrink cells matrix if needed

            this.set("numCells", this.get("numCells")-1);
            three.render();
        },

        clearCells: function(){
            this._loopCells(this.sparseCells, function(cell){//send destroy to top level
                if (cell) cell.destroy();
            });
            three.removeAllCells();//todo add flag in cell destroy to avoid redundancy here
            this.cells = [[[null]]];
            this.sparseCells = [[[null]]];
            this.set("cellsMax", null);
            this.set("cellsMin", null);
            this.set("nodes", []);
            this.set("numCells", 0);
            if (globals.basePlane) globals.basePlane.set("zIndex", 0);
            three.render();
        },

        calculateBoundingBox: function(){
            var scale = this._allAxesScales();
            var min = _.clone(this.get("cellsMin"));
            var max = _.clone(this.get("cellsMax"));
            _.each(_.keys(scale), function(key){
                min[key] *= scale[key];
                max[key] *= scale[key];
            });
            return {min:min, max:max};
        },





        //fill geometry

        subtractMesh: function(mesh){
            //todo this is specific to octa face

            var xScale = this.xScale();
            var yScale = this.yScale();
            var zScale = this.zScale();

            var cells = this.cells;
            var cellsMin = this.get("cellsMin");

            var allVertexPos = mesh.geometry.attributes.position.array;

            var zHeight = 0;
            for (var x=0;x<cells.length;x++){
                for (var y=0;y<cells[0].length;y++){
                    var firstCell = null;
                    for (var z=0;z<cells[0][0].length;z++){
                        firstCell = cells[x][y][z];
                        if (firstCell) break;
                    }
                    if (!firstCell) continue;//nothing in col

                    var origin = this._positionForIndex(firstCell.indices);
    //                    firstCell._calcPosition(0, this._add({x:x,y:y,z:z}, cellsMin));
                    zHeight = this._findIntersectionsInWindow(xScale/2, yScale/2, origin, allVertexPos) || zHeight;

                    zHeight = Math.floor(zHeight/zScale);
                    for (var z=0;z<zHeight;z++){
                        var cell = cells[x][y][z];
                        if (cell) cell.destroy();
                        cells[x][y][z] = null;
                    }
                }

            }
            three.render();
        },

        _findIntersectionsInWindow: function(windowX, windowY, origin, allVertexPos){
            for (var i=0;i<allVertexPos.length;i+=3){
                if (allVertexPos[i] > origin.x-windowX && allVertexPos[i] < origin.x+windowX
                    && allVertexPos[i+1] > origin.y-windowY && allVertexPos[i+1] < origin.y+windowY){
                    return allVertexPos[i+2];
                }
            }
            return null
        },






        //cells array

        checkForMatrixExpansion: function(cells, indicesMax, indicesMin){

            if (!cells) {
                console.warn("no cells specified in matrix expansion");
                return;
            }

            if (!this.get("cellsMax") || !this.get("cellsMin")){
                this.set("cellsMax", indicesMax);
                this.set("cellsMin", indicesMin);
                this._expandCellsArray(cells, (new THREE.Vector3()).subVectors(indicesMax, indicesMin), false);
                return;
            }

            var lastMax = this.get("cellsMax");
            var lastMin = this.get("cellsMin");
            var newMax = this._updateCellsMax(indicesMax, lastMax);
            var newMin = this._updateCellsMin(indicesMin, lastMin);
            if (newMax) {
                this._expandCellsArray(cells, (new THREE.Vector3()).subVectors(newMax, lastMax), false);
                this.set("cellsMax", newMax);
            }
            if (newMin) {
                this._expandCellsArray(cells, (new THREE.Vector3()).subVectors(lastMin, newMin), true);
                this.set("cellsMin", newMin);
            }
        },

        _expandCellsArray: function(cells, expansion, fromFront){

            _.each(_.keys(expansion), function(key){
                if (expansion[key] == 0) return;//no expansion on this axis

                var cellsX = cells.length;
                var cellsY = cells[0].length;
                var cellsZ = cells[0][0].length;

                if (key=="x"){
                    for (var x=0;x<expansion[key];x++){
                        var newLayer = [];
                        for (var y=0;y<cellsY;y++){
                            var newCol = [];
                            for (var z=0;z<cellsZ;z++){
                                newCol.push(null);
                            }
                            newLayer.push(newCol);
                        }
                        if (fromFront) cells.unshift(newLayer);
                        else cells.push(newLayer);
                    }
                } else if (key=="y"){
                    for (var x=0;x<cellsX;x++){
                        for (var y=0;y<expansion[key];y++){
                            var newCol = [];
                            for (var z=0;z<cellsZ;z++){
                                newCol.push(null);
                            }
                            if (fromFront) cells[x].unshift(newCol);
                            else cells[x].push(newCol);
                        }
                    }
                } else if (key=="z"){
                    for (var x=0;x<cellsX;x++){
                        for (var y=0;y<cellsY;y++){
                            for (var z=0;z<expansion[key];z++){
                                if (fromFront) cells[x][y].unshift(null);
                                else cells[x][y].push(null);
                            }
                        }
                    }
                }
            });
        },

        _updateCellsMin: function(newPosition, currentMin){
            var newMin = new THREE.Vector3();
            var hasChanged = false;
            _.each(_.keys(newPosition), function(key){
                if (newPosition[key]<currentMin[key]){
                    hasChanged = true;
                    newMin[key] = newPosition[key];
                } else {
                    newMin[key] = currentMin[key];
                }
            });
            if (hasChanged) return newMin;
            return false;
        },

        _updateCellsMax: function(newPosition, currentMax){
            var newMax = new THREE.Vector3();
            var hasChanged = false;
            _.each(_.keys(newPosition), function(key){
                if (newPosition[key]>currentMax[key]){
                    hasChanged = true;
                    newMax[key] = newPosition[key];
                } else {
                    newMax[key] = currentMax[key];
                }
            });
            if (hasChanged) return newMax;
            return false;
        },





        //composite Cells

        setToCompositeMode: function(callback){
            var self = this;
            require(['compositeEditorLattice'], function(CompositeEditorLattice){
                _.extend(self, CompositeEditorLattice);
                self._initCompositeEditor();
                if (callback) callback();
            });
        },





        //events

        _updatePartType: function(){
            this._iterCells(this.sparseCells, function(cell){
                if (cell) cell.destroyParts();
            });
            this._updateForMode();
        },

        _updateForMode: function(){
            var cellMode = appState.get("cellMode");
            var numCells = this.get("numCells");
            this._iterCells(this.sparseCells, function(cell){
                if (cell) cell.setMode(cellMode, function(){
                    if (--numCells <= 0) three.render();
                });
            });
        },

        _updateCellSeparation: function(){
            var cellSep = this.get("cellSeparation");
            globals.basePlane.updateXYSeparation(cellSep.xy);

            var cellMode = appState.get("cellMode");
            var partType = this.get("partType");
//            this._iterCells(this.cells, function(cell){
//                if (cell) cell.updateForScale(cellMode, partType);
//            });
            three.render();
        },

        _setCellVisibility: function(){
            if (appState.get("cellsVisible")) this.showCells();
            else this.hideCells();
        },

        //hide/show cells during stock simulation
        hideCells: function(){
            this._iterCells(this.cells, function(cell){
                if (cell) cell.hide();
            });
            three.render();
        },

        showCells: function(){
            var cellMode = appState.get("cellMode");
            this._iterCells(this.cells, function(cell){
                if (cell) cell.show(cellMode)
            });
            three.render();
        },

        showCellAtIndex: function(index){
            var latticeIndex = (new THREE.Vector3()).subVectors(index, this.get("cellsMin"));//index is probably a json object from gcode comment
            var cell = this.cells[latticeIndex.x][latticeIndex.y][latticeIndex.z];
            if (cell) cell.show();
            else console.warn("placing a cell that does not exist");
        },

        _loadMaterialClass: function(){
            var materialClass = this.get("materialClass");
            this.set("materialType", _.keys(plist.allMaterials[materialClass])[0], {silent:true});//set to default silently
            if (globals.materials[materialClass]) return;//already loaded
            require([materialClass + "Materials"], function(MaterialClass){
                globals.materials[materialClass] = MaterialClass;
            });
        },

        _navChanged: function(){
            var currentNav = appState.get("currentNav");
            if (currentNav != "navComposite" && this._undoCompositeEditor) this._undoCompositeEditor();
        },





        //lattice type

        _updateLatticeType: function(loadingFromFile){//do not clear cells if loading from file (cells array contains important metadata)

            this._setToDefaultsSilently();
            this._setDefaultCellMode();
            this._loadMaterialClass();

            if (loadingFromFile === undefined) loadingFromFile = false;
            if (loadingFromFile) console.warn('loading from file');
            this.clearCells();

            if (this._undo) this._undo();
            if (globals.basePlane) globals.basePlane.destroy();
            if (globals.highlighter) globals.highlighter.destroy();

            var subclass = this._getSubclassForLatticeType();
            var self = this;
            require([subclass], function(subclassObject){

                _.extend(self, subclassObject);
                self._initLatticeType();

                //copy over cells to new lattice type
                var cells = self.cells;
                self._loopCells(cells, function(cell, x, y, z){
                    if (!cell) return;
                    var index = _.clone(cell.index);
                    if (cell.destroy) cell.destroy();
                    self.makeCellForLatticeType(index, function(newCell){
                        cells[x][y][z] = newCell;
                    });
                });
                three.render();
            });
        },

        _getSubclassForLatticeType: function(){
            var cellType = this.get("cellType");
            var connectionType = this.get("connectionType");
            if (cellType == "octa"){
                if (connectionType == "face"){
                    return "octaFaceLattice";
                } else if (connectionType == "edge"){
                    return "octaEdgeLattice";
                } else if (connectionType == "edgeRot"){
                    return "octaRotEdgeLattice";
                } else if (connectionType == "vertex"){
                    return "octaVertexLattice";
                }
            } else if (cellType == "tetra"){
                if (connectionType == "stacked") return "tetraStackedLattice";
                else if (connectionType == "vertex") return "tetraVertexLattice";
            } else if (cellType == "cube"){
                if (connectionType == "face"){
                    return "cubeLattice";
                } else if (connectionType == "gik"){
                    return "gikLattice";
                }
            } else if (cellType == "truncatedCube"){
                return "truncatedCubeLattice";
            } else if (cellType == "kelvin"){
                return "kelvinLattice";
            } else {
                console.warn("unrecognized cell type " + cellType);
            }
            return null;
        },

        _setToDefaultsSilently: function(){
            var newCellType = this.get("cellType");
            var newConnectionType = this.get("connectionType");
            if (newConnectionType == this.previous("connectionType")){
                newConnectionType = _.keys(plist["allConnectionTypes"][newCellType])[0];
                this.set("connectionType", newConnectionType, {silent:true});
            }
            var partType = _.keys(plist["allPartTypes"][newCellType][newConnectionType])[0];
            this.set("partType", partType, {silent:true});
            this.set("materialClass", plist.allMaterialTypes[newCellType][newConnectionType], {silent:true});
        },

        _setDefaultCellMode: function(){//if no part associated with this lattice type
            if (!plist["allPartTypes"][this.get("cellType")][this.get("connectionType")]){
                appState.set("cellMode", "cell");
            }
        },





        //utils

        _iterCells: function(cells, callback){
            _.each(cells, function(cellLayer){
                _.each(cellLayer, function(cellColumn){
                    _.each(cellColumn, function(cell){
                        callback(cell, cellColumn, cellLayer);
                    });
                });

            });
        },

        _loopCells: function(cells, callback){
            for (var x=0;x<cells.length;x++){
                for (var y=0;y<cells[0].length;y++){
                    for (var z=0;z<cells[0][0].length;z++){
                        callback(cells[x][y][z], x, y, z, this);
                    }
                }
            }
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
            if (!cells) cells = this.cells;//grab cells once at beginning and hold onto it in case changes are made while looping
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
        },

        _allAxesScales: function(){
            var xScale = this.xScale();
            var yScale = this.yScale();
            var zScale = this.zScale();
            return {x:xScale, y:yScale, z:zScale};
        },





        //save/load

        toJSON: function(){//a minimal toJSON for ui stuff - no need to parse all cells
            return _.omit(this.attributes, ["cells", "nodes"]);//omit makes a copy
        }//todo something weird here

    });

    return new Lattice();

});