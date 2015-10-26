/**
 * Created by aghassaei on 6/11/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, globals, plist, THREE, three){

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
            var bBox = this.calculateBoundingBox();
            return bBox.max.sub(bBox.min).add(new THREE.Vector3(1,1,1));
        },

        getBoundingBox: function(){
            return this.calculateBoundingBox();
        },


        getNumCells: function(){
            return this.get("numCells");
        },



        //setters





        //lattice type

        _getLatticePlistData: function(){
            return plist.allLattices[this.get("cellType")].connection[this.get("connectionType")].type[this.get("applicationType")];
        },

        _setSparseCells: function(cells, subclass){

            this.clearCells();//composite lattice should always be empty

            console.log(this.get("numCells"));
            var numCells = this.get("numCells");

            var cellsMax = this.get("cellsMax");
            var cellsMin = this.get("cellsMin");
            if (cellsMax && cellsMin) this._checkForMatrixExpansion(cellsMax, cellsMin);

            var self = this;
            require([subclass], function(subclassObject){
                _.extend(self, subclassObject);
                if (numCells>0) {
                    self._bindRenderToNumCells(numCells);
                    self.parseCellsJSON(cells);
                }
            });
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
            var subclassFile = this.getCellSubclassFile();
            require(['materials'], function(materials){
                var materialID = json.materialID || appState.get("materialType");
                if (materials.isComposite(materialID)) subclassFile = "compositeCell";
                require([subclassFile], function(CellSubclass){
                    var cell = new CellSubclass(json);
                    if (callback) callback(cell);
                });
            });
        },

//        addCellsInRange: function(range){//add a block of cells (extrude)
//
//            this._checkForMatrixExpansion(range.max, range.min);
//
//            var cellsMin = this.get("cellsMin");
//            var relativeMin = (new THREE.Vector3()).subVectors(range.min, cellsMin);
//            var relativeMax = (new THREE.Vector3()).subVectors(range.max, this.get("cellsMin"));
//
//            var materialID = appState.get("materialType");
//            for (var x=relativeMin.x;x<=relativeMax.x;x++){
//                for (var y=relativeMin.y;y<=relativeMax.y;y++){
//                    for (var z=relativeMin.z;z<=relativeMax.z;z++){
//                        if (!this.sparseCells[x][y][z]) {
//                            var self = this;
//                             this.makeCellWithJSON({
//                                     index: (new THREE.Vector3(x, y, z)).add(cellsMin),
//                                     materialID: materialID
//                                 }, function(cell){
//                                    self.sparseCells[x][y][z] = cell;
//                                    self.set("numCells", self.get("numCells")+1);
//                                 });
//                        } else console.warn("already a cell there");
//                    }
//                }
//            }
//            three.render();
//        },

        addCellAtIndex: function(index, json){
            this._addCellAtIndex(index, json, function(){
                three.render();
            });
        },

        _addCellAtIndex: function(index, json, callback){
            var self = this;
            json = json || {};
            _.extend(json, {index: index, materialID:appState.get("materialType")});
            this.makeCellWithJSON(json, function(cell){

                var flattenedCells = cell.getCells();
                var bounds = cell.getAbsoluteBounds();

                if (self._checkForCellOverlap(flattenedCells, bounds.min)){
                    console.warn("overlap detected, addCellAtIndex operation cancelled");
                    cell.destroy();
                    return;
                }

                //todo optional do not check bounds
                var cellOutsideCurrentBounds = self._checkForIndexOutsideBounds(bounds.min) || self._checkForIndexOutsideBounds(bounds.max);
                if (cellOutsideCurrentBounds) self._expandCellsMatrix(bounds.max, bounds.min);
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

        removeCellAtIndex: function(index){
            index = this._getCellsIndexForLatticeIndex(index);
            if (this._checkForIndexOutsideBounds(index) || this.sparseCells[index.x][index.y][index.z] === null){
                console.warn("no cell at this index, removeCellAtIndex operation cancelled");
                return;
            }
            this.removeCell(this.sparseCells[index.x][index.y][index.z]);
        },

        removeCell: function(cell){

            if (!cell) {
                console.warn("no cell, removeCell operation cancelled");
                return;
            }
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
            if (this.get("numCells" == 0)) this.clearCells();//todo shrink matrices as you go
            three.render();
        },

        clearCells: function(silent){
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

            indicesMax.max(lastMax);
            indicesMin.min(lastMin);
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

//        _checkForMatrixContraction: function(deletedIndex){//this could be more efficient
//
//            var cellsMax = this.get("cellsMax");
//            var cellsMin = this.get("cellsMin");
//            if (!cellsMin || !cellsMax) {
//                console.warn("missing param for cells contraction");
//                return;
//            }
//
//            var newMin = this._contractCellsArray(this.cells, true, cellsMin.clone(), cellsMax.clone());
//            var newMax = null;
//            if (newMin) newMax = this._contractCellsArray(cells, false, newMin.clone(), cellsMax.clone());
//
//            //todo handle sparse cells
//
//
//            this.set("cellsMax", newMax, {silent:true});
//            this.set("cellsMin", newMin);
//
//            if (!newMin || !newMax){
//                cells = [[[null]]];
//            }
//
//        },
//
//        _contractCellsArray: function(cells, fromFront, cellsMin, cellsMax){
//
//            if (cellsMax.x < cellsMin.x || cellsMax.y < cellsMin.y || cellsMax.z < cellsMin.z) {
//                console.warn("something weird happened");
//                return null;
//            }
//
//            var xTrim = true;
//            var yTrim = true;
//            var zTrim = true;
//            this._loopCells(cells, function(cell, x, y, z){
//                if (fromFront){
//                    if (x == 0) xTrim = false;
//                    if (y == 0) yTrim = false;
//                    if (z == 0) zTrim = false;
//                } else {
//                    if (x == cellsMax.x-cellsMin.x) xTrim = false;
//                    if (y == cellsMax.y-cellsMin.y) yTrim = false;
//                    if (z == cellsMax.z-cellsMin.z) zTrim = false;
//                }
//            });
//
//            if (!xTrim && !yTrim && !zTrim) {
//                if (fromFront) return cellsMin;
//                return cellsMax;
//            }
//            if (xTrim) {
//                if (cells.length == 1) return null;
//                if (fromFront) {
//                    cellsMin.x += 1;
//                    cells.shift();
//                }
//                else {
//                    cellsMax.x -= 1;
//                    cells.pop();
//                }
//            }
//            if (yTrim || zTrim) {
//                if (yTrim){
//                    if (fromFront) cellsMin.y += 1;
//                    else cellsMax.y -= 1;
//                }
//                if (zTrim){
//                    if (fromFront) cellsMin.z += 1;
//                    else cellsMax.z -= 1;
//                }
//                _.each(cells, function(cellLayer){
//                    if (yTrim) {
//                        if (cellLayer.length == 1) return;
//                        if (fromFront) cellLayer.shift();
//                        else cellLayer.pop();
//                    }
//                    if (!zTrim) return;
//                    _.each(cellLayer, function(cellColumn){
//                        if (zTrim) {
//                            if (cellColumn.length == 1) return;
//                            if (fromFront) cellColumn.shift();
//                            else cellColumn.pop();
//                        }
//                    });
//                });
//            }
//            return this._contractCellsArray(cells, fromFront, cellsMin, cellsMax);
//        },






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

        hideCells: function(){
            this._loopCells(this.sparseCells, function(cell){
                cell.hide();
            });
            three.render();
        },

        showCells: function(){
            var cellMode = appState.get("cellMode");
            var numCells = this.get("numCells");
            var renderCallback = function(){
                if (--numCells <= 0) three.render();
            };
            this._loopCells(this.sparseCells, function(cell){
                cell.show(cellMode, renderCallback);
            });
        },

        setOpaque: function(){
            this._loopCells(this.sparseCells, function(cell){
                cell.setTransparent(false);
            });
            three.render();
        },






        //utils

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

        _parseSparseCell: function(){

            this.cells = [[[null]]];

            console.log("parse cells");

            if (this.get("numCells") == 0) {
                console.warn("no cells in assembly");
                this.cells = [[[null]]];
                return;
            }

            var bounds = this.calculateBoundingBox();
            this.set("cellsMin", bounds.min.clone().add(this.get("cellsMin")));
            var size = bounds.max.sub(bounds.min);

            //create array of nulls
            var cells = [];
            for (var x=0;x<size.x;x++){
                cells.push([]);
                for (var y=0;y<size.y;y++){
                    cells[x].push([]);
                    for (var z=0;z<size.z;z++){
                        cells[x][y].push(null);
                    }
                }
            }

            var min = this.get("cellsMin").sub(bounds.min);
            var overlap = [];
            var forCAM = appState.get("currentNav") == "navAssemble";
            this._loopCells(this.sparseCells, function(cell){
                var overlappingCells = cell.addToDenseArray(cells, min, forCAM);
                if (overlappingCells) overlap = overlap.concat(overlappingCells);
            });
            this.set("overlappingCells", overlap);

            this.cells = cells;
        },

        highlightOverlappingCells: function(){
            this._loopCells(this.sparseCells, function(cell){
                cell.setTransparent(true);
            });
            _.each(this.get("overlappingCells"), function(cell){
                cell.show();
            });
            three.render();
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
            this._loopCells(sparseCells, function(cell, x, y, z, self){
                var json = _.extend({index: (new THREE.Vector3(x, y, z)).add(cellsMin)}, cell);
                self._addCellAtIndex(new THREE.Vector3(x, y, z), json);
            });
        },

        getSaveJSON: function(){
            var data = this.toJSON();
            data.sparseCells = this.sparseCells;
            return data;
        },

        toJSON: function(){//a minimal toJSON for ui stuff - no need to parse all cells
            return _.omit(this.attributes, ["nodes"]);//omit makes a copy
        }//todo something weird here

    });
});