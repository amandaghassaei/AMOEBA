/**
 * Created by aghassaei on 6/11/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'console'],
    function(_, Backbone, appState, globals, plist, THREE, three, myConsole){

    return Backbone.Model.extend({

        defaults: {

            cellsMin: null,//min position of cells matrix
            cellsMax: null,//max position of cells matrix
            numCells: 0
        },


        initialize: function(options, classProperties, callback){

            this.cells = [[[null]]];//3D matrix containing all cells and null, dynamic size
            this.sparseCells = [[[null]]];//3D matrix containing highest hierarchical level of cells and null

            //bind events
            this.listenTo(appState, "change:cellMode", this._updateForMode);

            if (this.__initialize) this.__initialize(options, callback);
        },



        //getters

        getSize: function(){
            var cellsMax = this.get("cellsMax");
            var cellsMin = this.get("cellsMin");
            if (!cellsMax || !cellsMin) return new THREE.Vector3(0,0,0);
            return new THREE.Vector3(1,1,1).add(cellsMax.clone().sub(cellsMin));
        },

        getBoundingBox: function(){
            var cellsMax = this.get("cellsMax");
            var cellsMin = this.get("cellsMin");
            if (!cellsMax || !cellsMin) return new THREE.Vector3(0,0,0);
            return {min: cellsMin.clone(), max:cellsMax.clone()};
        },

        getOffset: function(){
            if (this.get("cellsMin")) return this.get("cellsMin").clone();
            return null;
        },

        getNumCells: function(){
            return this.get("numCells");
        },

        getSparseCells: function(){
            return this.sparseCells;
        },

        getCells: function(){
            return this.cells;
        },

        getSparseCellsJSON: function(){
            return JSON.parse(JSON.stringify(this.sparseCells));
        },

        getCellsJSON: function(){
            return JSON.parse(JSON.stringify(this.cells));
        },

        getSparseCellAtIndex: function(index){
            if (this._checkForIndexOutsideBounds(index)) return null;
            return this._getSparseCellAtIndex(this._getCellsIndexForLatticeIndex(index));
        },

        _getSparseCellAtIndex: function(index){
            return this.sparseCells[index.x][index.y][index.z];
        },

        getCellAtIndex: function(index){
            if (this._checkForIndexOutsideBounds(index)) return null;
            return this._getCellAtIndex(index);
        },

        _getCellAtIndex: function(index){
            return this.cells[index.x][index.y][index.z];
        },



        //setters





        //lattice type

        _getLatticePlistData: function(){
            return plist.allLattices[this.get("cellType")].connection[this.get("connectionType")].type[this.get("applicationType")];
        },

        _bindRenderToNumCells: function(numCells){
            var self = this;
            if (numCells > 0) this.listenTo(this, "change:numCells", function(){
                if (self.get("numCells") >= numCells){
                    self.stopListening(self, "change:numCells");
                    three.render();
                }
            });
        },





        //add/remove cells

        makeCellWithJSON: function(json, callback){
            var subclassFile = appState.lattice.getCellSubclassFile();
            require(['materials'], function(materials){
                var materialID = json.materialID || appState.get("materialType");
                if (materials.isComposite(materialID)) subclassFile = "compositeCell";
                require([subclassFile], function(CellSubclass){
                    var cell = new CellSubclass(json);
                    if (callback) callback(cell);
                });
            });
        },

        addCellsInRange: function(range, clone){//add a block of cells (extrude)

            var cellOutsideCurrentBounds = this._checkForIndexOutsideBounds(range.min) || this._checkForIndexOutsideBounds(range.max);
            if (cellOutsideCurrentBounds) this._expandCellsMatrix(range.max, range.min);

            var materialID = appState.get("materialType");

            var lastCellIndex = range.max;
            if (clone){
                var cloneSize = clone.get("size");
                var lastCloneIndex = new THREE.Vector3(0,0,0);
                for (var x=0;x<cloneSize.x;x++){
                    for (var y=0;y<cloneSize.y;y++){
                        for (var z=0;z<cloneSize.z;z++){
                            var relIndex = new THREE.Vector3(x, y, z);
                            var cell = clone.cellAtIndex(relIndex);
                            if (!cell) continue;
                            lastCellIndex = relIndex;
                        }
                    }
                }
                var numCopies = range.max.clone().sub(range.min).add(new THREE.Vector3(1,1,1)).divide(cloneSize).floor();
                lastCellIndex = range.min.clone().add(numCopies.sub(new THREE.Vector3(1,1,1)).multiply(cloneSize).add(lastCloneIndex));
            }

            var callback = null;
            for (var x=range.min.x;x<=range.max.x;x++){
                for (var y=range.min.y;y<=range.max.y;y++){
                    for (var z=range.min.z;z<=range.max.z;z++){
                        var index = new THREE.Vector3(x, y, z);
                        if (index.equals(lastCellIndex)) callback = function(){three.render();};
                        if (clone){
                            var relIndex = index.clone().sub(range.min);
                            var cloneSize = clone.get("size");
                            _.each(relIndex, function(val, key){
                                relIndex[key] = val%cloneSize[key];
                            });
                            var cell = clone.cellAtIndex(relIndex);
                            if (!cell) continue;
                            materialID = cell.getMaterialID();
                        }
                        this._addCellAtIndex(index, {materialID: materialID}, callback, true);
                    }
                }
            }
        },

        removeCellsInRange: function(range){//add a block of cells (extrude)

            for (var x=range.min.x;x<=range.max.x;x++){
                for (var y=range.min.y;y<=range.max.y;y++){
                    for (var z=range.min.z;z<=range.max.z;z++){
                        var index = new THREE.Vector3(x, y, z);
                        this.removeCellAtIndex(index, true, true);
                    }
                }
            }
            this._checkForMatrixContraction();
            three.render();
        },

        addCellAtIndex: function(index, json){
            this._addCellAtIndex(index, json, function(){
                myConsole.write("lattice.addCellAtIndex(" + index.x +", " + index.y + ", " + index.z + ")");
                three.render();
            });
        },

        _addCellAtIndex: function(index, json, callback, noCheck){
            var self = this;
            json = json || {};
            json = _.extend({index: index.clone(), materialID:appState.get("materialType")}, json);
            this.makeCellWithJSON(json, function(cell){

                var flattenedCells = cell.getCells();
                var bounds = cell.getAbsoluteBounds();

                if (self._checkForCellOverlap(flattenedCells, bounds.min)){
                    myConsole.warn("overlap detected, lattice.addCellAtIndex operation cancelled");
                    cell.destroy();
                    return;
                }

                if (!noCheck) {
                    var cellOutsideCurrentBounds = self._checkForIndexOutsideBounds(bounds.min) || self._checkForIndexOutsideBounds(bounds.max);
                    if (cellOutsideCurrentBounds) self._expandCellsMatrix(bounds.max, bounds.min);
                }
                var relIndex = self._getCellsIndexForLatticeIndex(index);

                if (flattenedCells === null) flattenedCells = [[[cell]]];
                self.sparseCells[relIndex.x][relIndex.y][relIndex.z] = cell;
                self._loopCells(flattenedCells, function(flatCell, x, y, z){
                    self.cells[relIndex.x+x][relIndex.y+y][relIndex.z+z] = flatCell;
                });

                self.set("numCells", self.get("numCells")+1);

                cell.addToScene();//add to three scene
                if (callback) callback();
            });
        },

        _getCellsIndexForLatticeIndex: function(index){
            var cellsMin = this.get("cellsMin");
            if (cellsMin === null) return new THREE.Vector3(0,0,0);
            return index.clone().sub(cellsMin);
        },

        _checkForCellOverlap: function(cells, offset){
            var existingCells = this.cells;
            var overlapDetected = false;
            var self = this;
            this._loopCells(cells, function(cell, x, y, z){
                if (overlapDetected) return;
                var index = new THREE.Vector3(x, y, z).add(offset);
                if (self._checkForIndexOutsideBounds(index)) return;
                index = self._getCellsIndexForLatticeIndex(index);
                if (existingCells[index.x][index.y][index.z]) overlapDetected = true;
            });
            return overlapDetected;
        },

        _checkForIndexOutsideBounds: function(index){
            var cellsMin = this.get("cellsMin");
            var cellsMax = this.get("cellsMax");
            if (cellsMax === null || cellsMin === null) return true;
            if (index.x < cellsMin.x || index.x > cellsMax.x) return true;
            if (index.y < cellsMin.y || index.y > cellsMax.y) return true;
            if (index.z < cellsMin.z || index.z > cellsMax.z) return true;
            return false;
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

        removeCellAtIndex: function(index, noRender, noCheck){
            var cellsIndex = this._getCellsIndexForLatticeIndex(index);
            if (this._checkForIndexOutsideBounds(index) || this.sparseCells[cellsIndex.x][cellsIndex.y][cellsIndex.z] === null){
                myConsole.warn("no cell at this index, lattice.removeCellAtIndex operation cancelled");
                return;
            }
            this._removeCell(this.sparseCells[cellsIndex.x][cellsIndex.y][cellsIndex.z], noCheck);
            myConsole.write("lattice.removeCellAtIndex(" + index.x +", " + index.y + ", " + index.z + ")");
            if (!noRender) three.render();
        },

        removeCell: function(cell){
            if (!cell) {
                myConsole.warn("no cell, lattice.removeCell operation cancelled");
                return;
            }
            var index = cell.getIndex();
            myConsole.write("lattice.removeCellAtIndex(" + index.x +", " + index.y + ", " + index.z + ")");
            this._removeCell(cell);
            three.render();
        },

        _removeCell: function(cell, noCheck){
            var json = cell.toJSON();//log data
            json.index = cell.getIndex();
            myConsole.log(JSON.stringify(json));

            var index = this._getCellsIndexForLatticeIndex(cell.getIndex());
            var flattenedCells = cell.getCells();
            this.sparseCells[index.x][index.y][index.z] = null;
            var self = this;
            this._loopCells(flattenedCells, function(flatCell, x, y, z){
                var flatCellIndex = new THREE.Vector3(x, y, z).add(index);
                self.cells[flatCellIndex.x][flatCellIndex.y][flatCellIndex.z] = null;
            });
            cell.destroy();

            this.set("numCells", this.get("numCells")-1);
            if (this.get("numCells") == 0) {
                this._clearCells();
                return;
            }

            if (!noCheck) this._checkForMatrixContraction();
        },

        clearCells: function(silent){
            myConsole.clear();
            myConsole.write("lattice.clearCells()");
            this._clearCells(silent);
        },

        _clearCells: function(silent){
            if (silent === undefined) silent = false;
            this._loopCells(this.sparseCells, function(cell){//send destroy to top level
                cell.destroy();
            });
            this.cells = [[[null]]];
            this.sparseCells = [[[null]]];
            this.set("cellsMax", null, {silent:silent});
            this.set("cellsMin", null, {silent:silent});
            this.set("numCells", 0, {silent:silent});
            if (this.__clearCells) this.__clearCells(silent);
            three.render();
        },

        setSparseCells: function(cells, offset){
            if (cells === undefined || cells == null) {
                console.warn("no cells given to setSparseCells");
                return;
            }
            this._setSparseCells(cells, offset);
        },

        _setSparseCells: function(cells, offset){

            offset = offset || this.getOffset() || new THREE.Vector3(0,0,0);
            if(this.get("numCells")>0) this.clearCells();
            this.set("cellsMin", new THREE.Vector3(offset.x, offset.y, offset.z));
            this.parseCellsJSON(cells);
        },







        //cells array

        _expandCellsMatrix: function(indicesMax, indicesMin){

            var lastMax = this.get("cellsMax");
            var lastMin = this.get("cellsMin");

            if (!lastMax || !lastMin){
                this.set("cellsMax", indicesMax);
                this.set("cellsMin", indicesMin);
                var size = indicesMax.clone().sub(indicesMin);
                this._expandArray(this.cells, size, false);
                this._expandArray(this.sparseCells, size, false);
                return;
            }

            indicesMax = indicesMax.clone().max(lastMax);
            indicesMin = indicesMin.clone().min(lastMin);
            if (!indicesMax.equals(lastMax)) {
                var size = indicesMax.clone().sub(lastMax);
                this._expandArray(this.cells, size, false);
                this._expandArray(this.sparseCells, size, false);
                this.set("cellsMax", indicesMax);
            }
            if (!indicesMin.equals(lastMin)) {
                var size = lastMin.clone().sub(indicesMin);
                this._expandArray(this.cells, size, true);
                this._expandArray(this.sparseCells, size, true);
                this.set("cellsMin", indicesMin);
            }
        },

        _expandArray: function(cells, expansion, fromFront){

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

        _checkForMatrixContraction: function(){//this could be more efficient by using info about deleted

            var cellsMax = this.get("cellsMax");
            var cellsMin = this.get("cellsMin");
            if (!cellsMin || !cellsMax) {
                console.warn("missing param for cells contraction");
                return;
            }

            var newMax = this._getContractedCellsMax();
            var newMin = this._getContractedCellsMin();

            var maxDiff = cellsMax.clone().sub(newMax);
            var minDiff =  newMin.clone().sub(cellsMin);

            var zero = new THREE.Vector3(0,0,0);
            if (maxDiff.equals(zero) && minDiff.equals(zero)) return;

            this._contractCellsArray(this.cells, false, maxDiff);
            this._contractCellsArray(this.sparseCells, false, maxDiff);
            this._contractCellsArray(this.cells, true, minDiff);
            this._contractCellsArray(this.sparseCells, true, minDiff);

            this.set("cellsMax", newMax, {silent:true});
            this.set("cellsMin", newMin);
        },

        _getContractedCellsMin: function(){
            var newMin = this.get("cellsMax").clone().sub(this.get("cellsMin"));
            this._loopCells(this.cells, function(cell, x, y, z){
                    newMin.min(new THREE.Vector3(x, y, z));
            });
            return newMin.add(this.get("cellsMin"));
        },

        _getContractedCellsMax: function(){
            var newMax = new THREE.Vector3(0,0,0);
            this._loopCells(this.cells, function(cell, x, y, z){
                newMax.max(new THREE.Vector3(x, y, z));
            });
            return newMax.add(this.get("cellsMin"));
        },

        _contractCellsArray: function(cells, fromFront, contractionSize){
            for (var x=0;x<contractionSize.x;x++){
                if (cells.length == 1) {
                    console.warn("nothing left to delete");
                    return;
                }
                if (fromFront) cells.shift();
                else cells.pop();
            }
            _.each(cells, function(cellLayer){
                for (var y=0;y<contractionSize.y;y++){
                    if (fromFront) cellLayer.shift();
                    else cellLayer.pop();
                }
                for (var z=0;z<contractionSize.z;z++){
                    _.each(cellLayer, function(cellColumn){
                        if (fromFront) cellColumn.shift();
                        else cellColumn.pop();
                    });
                }
            });
        },






        //events

        _updatePartType: function(){
            this._loopCells(this.sparseCells, function(cell){
                cell.destroyParts();
            });
            this._updateForMode();
        },

        _updateForMode: function(){
            var cellMode = appState.get("cellMode");
            if (cellMode == "hide"){
                this.hideCells();
                return;
            }

            if (appState.previous("cellMode") == "hide"){
                this.showCells();
            } else {
                this._setAllCellsMode(cellMode);
            }
        },

        _setAllCellsMode: function(cellMode){
            var numCells = this.get("numCells");
            var renderCallback = function(){
                if (--numCells <= 0) three.render();
            };
            this._loopCells(this.sparseCells, function(cell){
                cell.setMode(cellMode, renderCallback);
            });
        },

        hideCells: function(noRender){
            this._loopCells(this.sparseCells, function(cell){
                cell.hide();
            });
            if (!noRender) three.render();
        },

        showCells: function(){
            var cellMode = appState.get("cellMode");
            var numCells = this.get("numCells");
            var renderCallback = function(){
                if (--numCells <= 0) three.render();
            };
            this._loopCells(this.sparseCells, function(cell){
                cell.setTransparent(false);
                cell.show(cellMode, renderCallback);
            });
        },

        setOpaque: function(){
            this._loopCells(this.sparseCells, function(cell){
                cell.setTransparent(false);
            });
            three.render();
        },

        loopSketchLayer: function(index, planeType, callback, hideAll){
            if (hideAll) this.hideCells(true);
            var x = null;
            var y = null;
            var z = null;
            var cellMin = this.get("cellsMin");
            if (cellMin == null) return;
            if (planeType == "xy") z = index-cellMin.z;
            else if (planeType == "yz") x = index-cellMin.x;
            else y = index-cellMin.y;
            this.loopLayer(x, y, z, function(cell){
                callback(cell);
            });
        },

        makeHighlightableCells: function(index){
            if (!appState.get("showOneLayer")) {
                this.highlightableCells = null;
                return;
            }
            var cells = [];
            var planeType = globals.get("baseplane").get("planeType");
            this.loopSketchLayer(index, planeType, function(cell){
                cells.push(cell.getHighlightableMesh());
            });
            this.highlightableCells = cells;
        },





        //utils

        loopLayer: function(x, y, z, callback){
            var cells = this.cells;
            if (x !== null){
                if (x<0 || x>=cells.length) return;
                for (var y=0;y<cells[0].length;y++){
                    for (var z=0;z<cells[0][0].length;z++){
                        if (cells[x][y][z]) callback(cells[x][y][z], x, y, z, this);
                    }
                }
            } else if (y !== null){
                if (y<0 || y>=cells[0].length) return;
                for (var x=0;x<cells.length;x++){
                    for (var z=0;z<cells[0][0].length;z++){
                        if (cells[x][y][z]) callback(cells[x][y][z], x, y, z, this);
                    }
                }
            } else if (z !== null){
                if (z<0 || z>=cells[0][0].length) return;
                for (var x=0;x<cells.length;x++){
                    for (var y=0;y<cells[0].length;y++){
                        if (cells[x][y][z]) callback(cells[x][y][z], x, y, z, this);
                    }
                }
            }
        },

        loopCells: function(callback){
            this._loopCells(this.sparseCells, callback);
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

        _allAxesScales: function(){
            var xScale = this.xScale();
            var yScale = this.yScale();
            var zScale = this.zScale();
            return {x:xScale, y:yScale, z:zScale};
        },

        showCellAtIndex: function(index){
            index = (new THREE.Vector3()).subVectors(index, this.get("cellsMin"));//index is probably a json object from gcode comment
            var cell = this.cells[index.x][index.y][index.z];
            if (cell) cell.show();
            else console.warn("cell does not exist");
        },





        //save/load

        parseCellsJSON: function(sparseCells){
            var cellsMin = this.get("cellsMin");
            this._loopCells(sparseCells, function(json, x, y, z, self){
                var index = (new THREE.Vector3(x, y, z)).add(cellsMin);
                self._addCellAtIndex(index, json);
            });
            three.render();//todo doesn't work
        },

        getSaveJSON: function(){
            var data = this.toJSON();
            data.sparseCells = this.sparseCells;
            return data;
        }

    });
});