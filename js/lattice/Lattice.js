/**
 * Created by aghassaei on 1/16/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, globals, plist, THREE, three){

    var Lattice = Backbone.Model.extend({

        defaults: {

            units: "mm",

            nodes: [],
            cells: [[[null]]],//3D matrix containing all cells and null, dynamic size
            cellsMin: {x:0, y:0, z:0},//min position of cells matrix
            cellsMax: {x:0, y:0, z:0},//max position of cells matrix
            numCells: 0,

            scale: 20,

            //spacing for connectors/joints
            cellSeparation: {xy:0, z:0},

            cellType: "octa",
            connectionType: "face",
            partType: "triangle",
            materialType: "brass",
            materialClass: "electronic",
            superCellRange: new THREE.Vector3(4,1,1)
        },

        //pass in fillGeometry

        initialize: function(){

            //bind events
            this.listenTo(this, "change:partType", this._updatePartType);
            this.listenTo(this, "change:cellType change:connectionType", function(){
                this._updateLatticeType(false);
            });
            this.listenTo(this, "change:cellSeparation", this._updateCellSeparation);

            this.listenTo(appState, "change:cellMode", this._updateForMode);
            this.listenTo(appState, "change:cellsVisible", this._setCellVisibility);

            this.listenTo(this, "change:materialClass", this._loadMaterialClass);

            this._updateLatticeType(false);
        },

        ////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////ADD/REMOVE CELLS/////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////

        addCellsInRange: function(range){//add a block of cells (extrude)
            var cells = this.get("cells");
            var newCells = [];
            this.checkForMatrixExpansion(cells, range.max, range.min);

            var cellsMin = this.get("cellsMin");
            var relativeMin = this._subtract(range.min, cellsMin);
            var relativeMax = this._subtract(range.max, this.get("cellsMin"));

            for (var x=relativeMin.x;x<=relativeMax.x;x++){
                for (var y=relativeMin.y;y<=relativeMax.y;y++){
                    for (var z=relativeMin.z;z<=relativeMax.z;z++){
                        if (!cells[x][y][z]) {
                            var self = this;
                            var callback = function(cell){
                                newCells.push(cell);
                                self.set("numCells", self.get("numCells")+1);
                            };
                            cells[x][y][z] = this.makeCellForLatticeType(this._add({x:x, y:y, z:z}, cellsMin), callback);
                        } else console.warn("already a cell there");
                    }
                }
            }
            three.render();
            return newCells;
        },

        addCellAtIndex: function(indices, noRender, noCheck){//no render no check from fill

            var cells = this.get("cells");
            if (!noCheck || noCheck === undefined) this.checkForMatrixExpansion(cells, indices, indices);

            var index = this._subtract(indices, this.get("cellsMin"));
            if (!cells[index.x][index.y][index.z]) {
                var self = this;
                var callback = function(){
                    self.set("numCells", self.get("numCells")+1);
                    if (!noRender || noRender === undefined) three.render();
                };
                cells[index.x][index.y][index.z] = this.makeCellForLatticeType(indices, callback);
            } else console.warn("already a cell there");

        },

        _indexForPosition: function(absPosition){
            var position = {};
            position.x = Math.floor(absPosition.x/this.xScale());
            position.y = Math.floor(absPosition.y/this.yScale());
            position.z = Math.floor(absPosition.z/this.zScale());
            return position;
        },

        _positionForIndex: function(index){
            var position = _.clone(index);
            position.x = (position.x+0.5)*this.xScale();
            position.y = (position.y+0.5)*this.yScale();
            position.z = (position.z+0.5)*this.zScale();
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
            var index = this._subtract(cell.indices, this.get("cellsMin"));
            var cells = this.get("cells");
            cell.destroy();
            cells[index.x][index.y][index.z] = null;

            //todo shrink cells matrix if needed

            this.set("numCells", this.get("numCells")-1);
            three.render();
        },

        clearCells: function(){
            this._iterCells(this.get("cells"), function(cell){
                if (cell && cell.destroy) cell.destroy();
            });
            three.removeAllCells();//todo add flag in cell destroy to avoid redundancy here
            this.set("cells", [[[null]]]);
            this.set("cellsMax", {x:0, y:0, z:0});
            this.set("cellsMin", {x:0, y:0, z:0});
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

        ////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////FILL GEOMETRY////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////

        subtractMesh: function(mesh){
            //todo this is specific to octa face

            var xScale = this.xScale();
            var yScale = this.yScale();
            var zScale = this.zScale();

            var cells = this.get("cells");
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


        ////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////CELLS ARRAY//////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////

        checkForMatrixExpansion: function(cells, indicesMax, indicesMin){

            if (!cells) cells = this.get("cells");

            var lastMax = this.get("cellsMax");
            var lastMin = this.get("cellsMin");
            var newMax = this._updateCellsMax(indicesMax, lastMax);
            var newMin = this._updateCellsMin(indicesMin, lastMin);
            if (newMax) {
                this._expandCellsArray(cells, this._subtract(newMax, lastMax), false);
                this.set("cellsMax", newMax);
            }
            if (newMin) {
                this._expandCellsArray(cells, this._subtract(lastMin, newMin), true);
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
            var newMin = {};
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
            var newMax = {};
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

        ////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////EVENTS//////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////

        _updatePartType: function(){
            this._iterCells(this.get("cells"), function(cell){
                if (cell) cell.destroyParts();
            });
            this._updateForMode();
        },

        _updateForMode: function(){
            var cellMode = appState.get("cellMode");
            this._iterCells(this.get("cells"), function(cell){
                if (cell) cell.setMode(cellMode);
            });
            three.render();
        },

        _updateCellSeparation: function(){
            var cellSep = this.get("cellSeparation");
            globals.basePlane.updateXYSeparation(cellSep.xy);

            var cellMode = appState.get("cellMode");
            var partType = this.get("partType");
            this._iterCells(this.get("cells"), function(cell){
                if (cell) cell.updateForScale(cellMode, partType);
            });
            three.render();
        },

        _setCellVisibility: function(){
            if (appState.get("cellsVisible")) this.showCells();
            else this.hideCells();
        },

        //hide/show cells during stock simulation
        hideCells: function(){
            this._iterCells(this.get("cells"), function(cell){
                if (cell) cell.hide();
            });
            three.render();
        },

        showCells: function(){
            var cellMode = appState.get("cellMode");
            this._iterCells(this.get("cells"), function(cell){
                if (cell) cell.show(cellMode)
            });
            three.render();
        },

        showCellAtIndex: function(index){
            var latticeIndex = this._subtract(index, this.get("cellsMin"));
            var cell = this.get("cells")[latticeIndex.x][latticeIndex.y][latticeIndex.z];
            if (cell) cell.show();
            else console.warn("placing a cell that does not exist");
        },

        _loadMaterialClass: function(){
            var materialClass = this.get("materialClass");
            if (globals.materials[materialClass]) return;//already loaded
            require([materialClass + "Materials"], function(MaterialClass){
                globals.materials[materialClass] = MaterialClass;
            });
        },

        ////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////CONNECTION TYPE//////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////

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
                var cells = self.get("cells");
                self._loopCells(cells, function(cell, x, y, z){
                    if (!cell) return;
                    var index = _.clone(cell.index);
                    if (cell.destroy) cell.destroy();
                    cells[x][y][z] = self.makeCellForLatticeType(index);// parentPos, parentOrientation, direction, parentType, type)
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
                return "cubeLattice";
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
        },

        _setDefaultCellMode: function(){//if no part associated with this lattice type
            if (!plist["allPartTypes"][this.get("cellType")][this.get("connectionType")]){
                appState.set("cellMode", "cell");
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////UTILS///////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////

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
            if (!cells) cells = this.get("cells");//grab cells once at beginning and hold onto it in case changes are made while looping
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
                if (this._rasterGikCells) {
                    this._rasterGikCells(order, callback, var1, var2, var3, cells);
                    return;
                }
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

        _subtract: function(pos1, pos2){
            return {x:pos1.x-pos2.x, y:pos1.y-pos2.y, z:pos1.z-pos2.z};
        },

        _add: function(pos1, pos2){
            return {x:pos1.x+pos2.x, y:pos1.y+pos2.y, z:pos1.z+pos2.z};
        },

        ////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////UI///////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////

        toJSON: function(){//a minimal toJSON for ui stuff - no need to parse all cells
            return _.omit(this.attributes, ["cells", "nodes"]);//omit makes a copy
        }//todo something weird here

    });

    return new Lattice();

});