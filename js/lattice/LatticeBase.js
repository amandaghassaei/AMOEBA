/**
 * Created by aghassaei on 6/11/15.
 */


/**
 * Created by aghassaei on 1/16/15.
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
            this.listenTo(appState, "change:cellsVisible", this._setCellVisibility);

            if (this.__initialize) this.__initialize(options, callback);
        },






        //lattice type

        _updateLatticeType: function(cells, subclass){//do not clear cells if loading from file (cells array contains important metadata)

            if (!cells) {
                if (this._setToDefaultsSilently) this._setToDefaultsSilently();
                cells = JSON.parse(JSON.stringify(this.sparseCells));
            }

            if (this._setDefaultCellMode) this._setDefaultCellMode();

            var cellsMin = this.get("cellsMin");
            var cellsMax = this.get("cellsMax");
            this._bindRenderToNumCells(this.get("numCells"));
            this.clearCells();

            if (this._undo) this._undo();
            if (this._isSingltonLattice()){
                if (globals.basePlane) globals.basePlane.destroy();
                if (globals.highlighter) globals.highlighter.destroy();
            }

            if (cellsMax && cellsMin) this.checkForMatrixExpansion(this.sparseCells, cellsMax, cellsMin);
            var self = this;
            require([subclass || this._getSubclassForLatticeType()], function(subclassObject){
                _.extend(self, subclassObject);
                if (self._isSingltonLattice()) self._initLatticeType();//only do this for the lattice singleton
                if (self.get("cellsMin")) self.parseCellsJSON(cells);
            });
        },

        _isSingltonLattice: function(){
            return false;
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

        makeCellForLatticeType: function(json, callback){
            var subclassFile = this.getCellSubclassFile();
            if (json.materialName && json.materialName.substr(0,5) == "super") subclassFile = "compositeCell";
            require([subclassFile], function(CellSubclass){
                var cell = new CellSubclass(json);
                if (callback) callback(cell);
            });
        },

        addCellsInRange: function(range){//add a block of cells (extrude)

            this.checkForMatrixExpansion(this.sparseCells, range.max, range.min);

            var cellsMin = this.get("cellsMin");
            var relativeMin = (new THREE.Vector3()).subVectors(range.min, cellsMin);
            var relativeMax = (new THREE.Vector3()).subVectors(range.max, this.get("cellsMin"));

            var materialName = appState.get("materialType");
            for (var x=relativeMin.x;x<=relativeMax.x;x++){
                for (var y=relativeMin.y;y<=relativeMax.y;y++){
                    for (var z=relativeMin.z;z<=relativeMax.z;z++){
                        if (!this.sparseCells[x][y][z]) {
                            var self = this;
                             this.makeCellForLatticeType({
                                     index: (new THREE.Vector3(x, y, z)).add(cellsMin),
                                     materialName: materialName
                                 }, function(cell){
                                    self.sparseCells[x][y][z] = cell;
                                    self.set("numCells", self.get("numCells")+1);
                                 });
                        } else console.warn("already a cell there");
                    }
                }
            }
            three.render();
        },

        addCellAtIndex: function(index, noRender, noCheck){//no render no check from fill/load

            if (!noCheck || noCheck === undefined) this.checkForMatrixExpansion(this.sparseCells, index, index);

            var relIndex = (new THREE.Vector3()).subVectors(index, this.get("cellsMin") || index);
            if (!noRender || noRender === undefined) three.setRenderFlag();
            this.addCellWithJson({index: index, materialName:appState.get("materialType")}, relIndex);
        },

        addCellWithJson: function(json, index){
            var self = this;
            if (!this.sparseCells[index.x][index.y][index.z]) {
                this.makeCellForLatticeType(json, function(cell){
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

            this._checkForMatrixContraction(this.sparseCells);

            this.set("numCells", this.get("numCells")-1);
            three.render();
        },

        clearCells: function(silent){
            if (silent === undefined) silent = false;
            this._loopCells(this.sparseCells, function(cell){//send destroy to top level
                if (cell) cell.destroy();
            });
            this.cells = [[[null]]];
            this.sparseCells = [[[null]]];
            this.set("cellsMax", null, {silent:silent});
            this.set("cellsMin", null, {silent:silent});
            this.set("numCells", 0, {silent:silent});
            if (this.__clearCells) this.__clearCells(silent);
            three.render();
        },

        calculateBoundingBox: function(){
            if (!this.get("cellsMax") || !this.get("cellsMin")) return new THREE.Vector3(0,0,0);
            var dimMax = this.get("cellsMax").clone().sub(this.get("cellsMin")).add(new THREE.Vector3(1,1,1));
            var dimMin = new THREE.Vector3(0,0,0);
            this._loopCells(this.sparseCells, function(cell, x, y, z){
                if (cell){
                    var material = cell.getMaterial();
                    if (material.dimensions){
                        var subCellRange = (new THREE.Vector3(x, y, z)).add(cell.applyRotation(material.dimensions.clone()));
                        dimMax.max(subCellRange);
                        dimMin.min(subCellRange);
                    } else if (cell.length){
                        var subCellRange = (new THREE.Vector3(x, y, z)).add(cell.applyRotation(new THREE.Vector3(cell.length, 1, 1)));
                        dimMax.max(subCellRange);
                        dimMin.min(subCellRange);
                    }
                }
            });
            return dimMax.sub(dimMin);
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

        _checkForMatrixContraction: function(cells, deletedIndex){//this could be more efficient

            var cellsMax = this.get("cellsMax");
            var cellsMin = this.get("cellsMin");
            if (!cells || !cellsMin || !cellsMax) {
                console.warn("missing param for cells contraction");
                return;
            }

            var newMin = this._contractCellsArray(cells, true, cellsMin.clone(), cellsMax.clone());
            var newMax = null;
            if (newMin) newMax = this._contractCellsArray(cells, false, newMin.clone(), cellsMax.clone());

            this.set("cellsMax", newMax, {silent:true});
            this.set("cellsMin", newMin);

            if (!newMin || !newMax){
                cells = [[[null]]];
            }

        },

        _contractCellsArray: function(cells, fromFront, cellsMin, cellsMax){

            if (cellsMax.x < cellsMin.x || cellsMax.y < cellsMin.y || cellsMax.z < cellsMin.z) return null;

            var xTrim = true;
            var yTrim = true;
            var zTrim = true;
            this._loopCells(cells, function(cell, x, y, z){
                if (cell){
                    if (fromFront){
                        if (x == 0) xTrim = false;
                        if (y == 0) yTrim = false;
                        if (z == 0) zTrim = false;
                    } else {
                        if (x == cellsMax.x-cellsMin.x) xTrim = false;
                        if (y == cellsMax.y-cellsMin.y) yTrim = false;
                        if (z == cellsMax.z-cellsMin.z) zTrim = false;
                    }
                }
            });

            if (!xTrim && !yTrim && !zTrim) {
                if (fromFront) return cellsMin;
                return cellsMax;
            }
            if (xTrim) {
                if (cells.length == 1) return null;
                if (fromFront) {
                    cellsMin.x += 1;
                    cells.shift();
                }
                else {
                    cellsMax.x -= 1;
                    cells.pop();
                }
            }
            if (yTrim || zTrim) {
                if (yTrim){
                    if (fromFront) cellsMin.y += 1;
                    else cellsMax.y -= 1;
                }
                if (zTrim){
                    if (fromFront) cellsMin.z += 1;
                    else cellsMax.z -= 1;
                }
                _.each(cells, function(cellLayer){
                    if (yTrim) {
                        if (cellLayer.length == 1) return;
                        if (fromFront) cellLayer.shift();
                        else cellLayer.pop();
                    }
                    if (!zTrim) return;
                    _.each(cellLayer, function(cellColumn){
                        if (zTrim) {
                            if (cellColumn.length == 1) return;
                            if (fromFront) cellColumn.shift();
                            else cellColumn.pop();
                        }
                    });
                });
            }
            return this._contractCellsArray(cells, fromFront, cellsMin, cellsMax);
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

        _setCellVisibility: function(){
            if (appState.get("cellsVisible")) this.showCells();
            else this.hideCells();
        },

        hideCells: function(){
            this._iterCells(this.sparseCells, function(cell){
                if (cell) cell.hide();
            });
            three.render();
        },

        showCells: function(){
            var cellMode = appState.get("cellMode");
            this._iterCells(this.sparseCells, function(cell){
                if (cell) cell.show(cellMode)
            });
            three.render();
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

        _allAxesScales: function(){
            var xScale = this.xScale();
            var yScale = this.yScale();
            var zScale = this.zScale();
            return {x:xScale, y:yScale, z:zScale};
        },





        //save/load

        parseCellsJSON: function(sparseCells){
            var cellsMin = this.get("cellsMin");
            this._loopCells(sparseCells, function(cell, x, y, z, self){
                if (cell) {
                    cell.index = (new THREE.Vector3(x, y, z)).add(cellsMin);
                    self.addCellWithJson(cell, new THREE.Vector3(x, y, z));
                }
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