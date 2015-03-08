/**
 * Created by aghassaei on 1/16/15.
 */


Lattice = Backbone.Model.extend({

    defaults: {

        nodes: [],
        cells: [[[null]]],//3D matrix containing all cells and null, dynamic size
        cellsMin: {x:0, y:0, z:0},//min position of cells matrix
        cellsMax: {x:0, y:0, z:0},//max position of cells matrix
        inverseCells: [[[null]]],//3d matrix containing all inverse cells and null, dynamic size
        inverseCellsMin: {x:0, y:0, z:0},//min position of inverse cells matrix
        inverseCellsMax: {x:0, y:0, z:0},//max position of inverse cells matrix
        numCells: 0,
        numInvCells: 0,

        basePlane: null,//plane to build from
        scale: 20,
        highlighter: null,//highlights build-able surfaces
        shouldPreserveCells: true,//preserve cells when changing lattice type

        //spacing for connectors/joints
        columnSeparation: 0.0,//todo get rid of this
        xSeparation: 0.0,
        ySeparation: 0.0,
        zSeparation: 0.0,

        cellMode: "cell",//show cells vs parts
        inverseMode: false,//show negative space
        cellType: "octa",
        connectionType: "face",
        partType: "triangle"
    },

    //pass in fillGeometry

    initialize: function(){

        //bind events
        this.listenTo(this, "change:scale", this._scaleDidChange);
        this.listenTo(this, "change:inverseMode change:cellMode", this._updateForMode);
        this.listenTo(this, "change:cellType change:connectionType", this._updateLatticeType);

    },

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////ADD/REMOVE CELLS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    addCellsInRange: function(range){//add a block of cells (extrude)
        var scale = this.get("scale");
        var cells = this.get("cells");
        this._checkForMatrixExpansion(cells, range.max, range.min, "cellsMax", "cellsMin");

        var cellsMin = this.get("cellsMin");
        var relativeMin = this._subtract(range.min, cellsMin);
        var relativeMax = this._subtract(range.max, this.get("cellsMin"));

        for (var x=relativeMin.x;x<=relativeMax.x;x++){
            for (var y=relativeMin.y;y<=relativeMax.y;y++){
                for (var z=relativeMin.z;z<=relativeMax.z;z++){
                    if (!cells[x][y][z]) {
                        cells[x][y][z] = this._makeCellForLatticeType(this._add({x:x, y:y, z:z}, cellsMin), scale);
                        this.set("numCells", this.get("numCells")+1);
                    } else console.warn("already a cell there");
                }
            }
        }
        dmaGlobals.three.render();
    },

    addCellAtIndex: function(indices){

        var scale = this.get("scale");
        var cells = this.get("cells");
        this._checkForMatrixExpansion(cells, indices, indices, "cellsMax", "cellsMin");

        var index = this._subtract(indices, this.get("cellsMin"));
        if (!cells[index.x][index.y][index.z]) {
            cells[index.x][index.y][index.z] = this._makeCellForLatticeType(indices, scale);
            this.set("numCells", this.get("numCells")+1);
            dmaGlobals.three.render();
        } else console.warn("already a cell there");

    },

    _addInverseCellsForIndex: function(index){

        var inverseIndicesToAdd = this._inverseIndicesToAdd(_.clone(index));

        var invCells = this.get("inverseCells");
        var scale = this.get("scale");
        var self = this;
        _.each(inverseIndicesToAdd, function(invIndex){
            self._checkForMatrixExpansion(invCells, invIndex, invIndex, "inverseCellsMax", "inverseCellsMin");
            var indexRel = self._subtract(invIndex, self.get("inverseCellsMin"));
            if (!invCells[indexRel.x][indexRel.y][indexRel.z]) {
                invCells[indexRel.x][indexRel.y][indexRel.z] = self._makeInvCellForLatticeType(invIndex, scale);
                self.set("numInvCells", self.get("numInvCells")+1);
            }
        });
    },

    _indexForPosition: function(absPosition){
        var position = {};
        var scale = this.get("scale");
        position.x = Math.floor(absPosition.x/this.xScale(scale));
        position.y = Math.floor(absPosition.y/this.yScale(scale));
        position.z = Math.floor(absPosition.z/this.zScale(scale));
        return position;
    },

    _positionForIndex: function(index){
        var scale = this.get("scale");
        var position = _.clone(index);
        position.x = (position.x+0.5)*this.xScale(scale);
        position.y = (position.y+0.5)*this.yScale(scale);
        position.z = (position.z+0.5)*this.zScale(scale);
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
        dmaGlobals.three.render();
    },

    //todo send clear all to three anddestroy without sceneRemove to cell
    clearCells: function(){
        this._iterCells(this.get("cells"), function(cell){
            if (cell && cell.destroy) cell.destroy();
        });
        this.set("cells", [[[null]]]);
        this._clearInverseCells();
        this.set("cellsMax", {x:0, y:0, z:0});
        this.set("cellsMin", {x:0, y:0, z:0});
        this.set("nodes", []);
        this.set("numCells", 0);
        if (this.get("basePlane")) this.get("basePlane").set("zIndex", 0);
        dmaGlobals.three.render();
    },

    _clearInverseCells: function(){
        this._iterCells(this.get("inverseCells"), function(cell){
            if (cell && cell.destroy) cell.destroy();
        });
        this.set("inverseCells", [[[null]]]);
        this.set("inverseCellsMin", {x:0, y:0, z:0});
        this.set("inverseCellsMax", {x:0, y:0, z:0});
        this.set("numInvCells", 0);
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////FILL GEOMETRY////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    subtractMesh: function(mesh){
        //todo this is specific to octa face

        var scale = this.get("scale");
        var xScale = this.xScale(scale);
        var yScale = this.yScale(scale);
        var zScale = this.zScale(scale);

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
        dmaGlobals.three.render();
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

    _checkForMatrixExpansion: function(cells, indicesMax, indicesMin, maxName, minName){

        var lastMax = this.get(maxName);
        var lastMin = this.get(minName);
        var newMax = this._updateCellsMax(indicesMax, lastMax);
        var newMin = this._updateCellsMin(indicesMin, lastMin);
        if (newMax) {
            this._expandCellsArray(cells, this._subtract(newMax, lastMax), false);
            this.set(maxName, newMax);
        }
        if (newMin) {
            this._expandCellsArray(cells, this._subtract(lastMin, newMin), true);
            this.set(minName, newMin);
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

    _subtract: function(pos1, pos2){
        return {x:pos1.x-pos2.x, y:pos1.y-pos2.y, z:pos1.z-pos2.z};
    },

    _add: function(pos1, pos2){
        return {x:pos1.x+pos2.x, y:pos1.y+pos2.y, z:pos1.z+pos2.z};
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////EVENTS//////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    _updateForMode: function(){
        var cellMode = this.get("cellMode");
        var inverseMode = this.get("inverseMode");
        var scale = this.get("scale");
        this._iterCells(this.get("cells"), function(cell){
            if (cell) cell.drawForMode(scale, cellMode, inverseMode);
        });
        this._iterCells(this.get("inverseCells"), function(cell){
            if (cell) cell.drawForMode(scale, cellMode, inverseMode);
        });
        dmaGlobals.three.render();
    },

    _scaleDidChange: function(){
        var scale = this.get("scale");
        this.get("basePlane").updateScale(scale);
        this.get("highlighter").updateScale(scale);

        var cellMode = this.get("cellMode");
        this._iterCells(this.get("cells"), function(cell){
            if (cell) cell.updateForScale(scale, cellMode);
        });
        this._iterCells(this.get("inverseCells"), function(cell){
            if (cell) cell.updateForScale(scale, cellMode);
        });

        dmaGlobals.three.render();
    },

    previewScaleChange: function(scale){
        this.get("basePlane").updateScale(scale);
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////CONNECTION TYPE//////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    _updateLatticeType: function(arg1, arg2, arg3, loadingFromFile){//do not clear cells if loading from file (cells array contains important metadata)
        if (typeof loadingFromFile == "undefined") loadingFromFile = false;
        var cellType = this.get("cellType");
        var connectionType = this.get("connectionType");
        if (!loadingFromFile && !this.get("shouldPreserveCells")) this.clearCells();
        if (this._undo) this._undo();
        if (this.get("basePlane")) this.get("basePlane").destroy();
        if (this.get("highlighter")) this.get("highlighter").destroy();
        if (cellType == "octa"){
            if (connectionType == "face"){
                _.extend(this, this.OctaFaceLattice);
            } else if (connectionType == "freeformFace"){
                if (!loadingFromFile) this.clearCells();
                _.extend(this, this.OctaFreeFormFaceLattice);
            } else if (connectionType == "edge"){
                _.extend(this, this.OctaFaceLattice);
                _.extend(this, this.OctaEdgeLattice);
            } else if (connectionType == "edgeRot"){
                _.extend(this, this.OctaRotEdgeLattice);
            } else if (connectionType == "vertex"){
                _.extend(this, this.OctaVertexLattice);
            }
        } else if (cellType == "cube"){
            _.extend(this, this.CubeLattice);
        }
        this._initLatticeType();

        if (loadingFromFile || this.get("shouldPreserveCells")){
            var self = this;
            var scale = this.get("scale");
            var cells = this.get("cells");
            this._clearInverseCells();
            this._loopCells(cells, function(cell, x, y, z){
                if (!cell) return;

                var index = _.clone(cell.indices);
                var parts = _.clone(cell.parts);
                if (cell.parentOrientation) var parentOrientation = new THREE.Quaternion(cell.parentOrientation._x, cell.parentOrientation._y, cell.parentOrientation._z, cell.parentOrientation._w);
                if (cell.parentPosition) var parentPos = cell.parentPosition;
                if (cell.direction) var direction = new THREE.Vector3(cell.direction.x, cell.direction.y, cell.direction.z);
                if (cell.parentType) var parentType = cell.parentType;
                if (cell.type) var type = cell.type;

                if (cell.destroy) cell.destroy();
                var newCell = self._makeCellForLatticeType(index, scale, parentPos, parentOrientation, direction, parentType, type);

                if (parts) {
                    //todo make this better
                    newCell.parts = newCell._initParts();
                    for (var i=0;i<newCell.parts.length;i++){
                        if (!parts[i]) {
                            newCell.parts[i].destroy();
                            newCell.parts[i] = null;
                        }

                    }
                }
                cells[x][y][z] = newCell;
            });
            dmaGlobals.three.render();
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
                    callback(cells[x][y][z], x, y, z);
                }
            }
        }
    },

    saveJSON: function(name){
        if (!name) name = "lattice";
        var data = JSON.stringify(_.omit(this.toJSON(), ["highlighter", "basePlane"]));
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + ".json");
    },

    loadFromJSON: function(data){
        this.clearCells();
        var data = JSON.parse(data);
        var self = this;
        _.each(_.keys(data), function(key){
            self.set(key, data[key], {silent:true});
        });
        this.set("shouldPreserveCells", true, {silent:true});
        this._updateLatticeType(null, null, null, true);
    },

////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////FACE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


    OctaFaceLattice: {

        _initLatticeType: function(){

            //bind events
            this.set("columnSeparation", 0.0);
            this.listenTo(this, "change:columnSeparation", this._changeColSeparation);

            this.set("basePlane", new OctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaFaceHighlighter({scale:this.get("scale")}));

        },

        _changeColSeparation: function(){
            var colSep = this.get("columnSeparation");
            var scale = this.get("scale");
            var cellMode = this.get("cellMode");
            this.get("basePlane").updateColSeparation(colSep);
            this._iterCells(this.get("cells"), function(cell){
                if (cell) cell.updateForScale(scale, cellMode);
            });
            dmaGlobals.three.render();
        },

        getIndexForPosition: function(absPosition){
            var scale = this.get("scale");
            var yIndex = Math.floor(absPosition.y/this.yScale(scale));
            if (yIndex%2 != 0) absPosition.x += this.xScale(scale)/2;
            var index = this._indexForPosition(absPosition);
            if (index.z%2 == 1) index.y += 1;
            return index;
        },

        getPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);
            var xScale = this.xScale(scale);
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale(scale)+scale/Math.sqrt(3)/2;
            position.z = (position.z+0.5)*this.zScale(scale);
            if ((index.y%2) != 0) position.x -= this.xScale(scale)/2;
            return position;
        },

        getInvCellPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);

            var oddZ = position.z%2 != 0;
            var upPoint = (position.z%4 == 0 || Math.abs(position.z%4) == 3);
            position.z = Math.floor(position.z/2);

            if (!upPoint){
                position.x = (position.x)*this.xScale(scale);
                position.y = position.y*this.yScale(scale);
            } else {
                position.x = (position.x+0.5)*this.xScale(scale);
                position.y = (position.y)*this.yScale(scale)-scale/Math.sqrt(3)/2;
            }

            if (oddZ){
                position.z = (position.z + 1)*this.zScale(scale);
            } else {
                position.z = (position.z)*this.zScale(scale);
            }

//            if (Math.abs(index.z%4) == 1 || Math.abs(index.z%4) == 2) position.z += this.zScale(scale);

            if ((index.y%2) != 0) {
                if (!upPoint){
                    position.x += this.xScale(scale)/2;
                } else {
                    position.x -= this.xScale(scale)/2;
                }
            }

            return position;
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            var colSep = this.get("columnSeparation");
            return scale*(1+2*colSep);
        },

        yScale: function(scale){
            return this.xScale(scale)/2*Math.sqrt(3);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return 2*scale/Math.sqrt(6);
        },

        _makeCellForLatticeType: function(indices, scale){
            this._addInverseCellsForIndex(indices);
            return new DMAFaceOctaCell(indices, scale);
        },

        _makeInvCellForLatticeType: function(indices, scale){
            return new DMATetraFaceCell(indices, scale, true);
        },

        _inverseIndicesToAdd: function(index){

            var oddZ = index.z%2 != 0;

            index = _.clone(index);
            index.z*=2;

            var z0 = 0;
            if (oddZ) z0 = 1;

            if (this.get("connectionType") == "edge") z0 = 0;
            var z1 = Math.abs(z0-1);

            var inverseIndicesToAdd;
            if (index.y%2 == 0){

                inverseIndicesToAdd = [
                    this._add(index, {x:0,y:0,z:z0}),
                    this._add(index, {x:0,y:1,z:z0}),
                    this._add(index, {x:1,y:1,z:z0}),

                    this._add(index, {x:0,y:0,z:z1}),
                    this._add(index, {x:0,y:1,z:z1}),
                    this._add(index, {x:1,y:0,z:z1})
                ];
            } else {
                inverseIndicesToAdd = [
                    this._add(index, {x:0,y:0,z:z0}),
                    this._add(index, {x:-1,y:1,z:z0}),
                    this._add(index, {x:0,y:1,z:z0}),

                    this._add(index, {x:-1,y:0,z:z1}),
                    this._add(index, {x:0,y:1,z:z1}),
                    this._add(index, {x:0,y:0,z:z1})
                ];
            }
            return inverseIndicesToAdd;
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            this.stopListening(this, "change:columnSeparation");
            var self = this;
            _.each(_.keys(this.OctaFaceLattice), function(key){
                self[key] = null;
            });
        }

    },


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////FACE CONN OCTA FREEFORM////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


    OctaFreeFormFaceLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new OctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaFreeFormHighlighter({scale:this.get("scale")}));

            this.set("freeformCellType", "octa");

        },

        addFreeFormCell: function(parentCellPos, parentCellOrient, direction, parentType, type){
            var scale = this.get("scale");
            var cells = this.get("cells");
            cells[0][0].push(this._makeCellForLatticeType({x:0,y:0,z:cells[0][0].length}, scale, parentCellPos, parentCellOrient, direction, parentType, type));
            this.set("numCells", this.get("numCells")+1);
            dmaGlobals.three.render();
        },

        _makeCellForLatticeType: function(index, scale, parentPosition, parentOrientation, direction, parentType, type){
            if (type){
                if (type == "octa") return new DMAFreeFormOctaCell(index, scale, parentPosition, parentOrientation, direction, parentType);
                return new DMAFreeFormTetraCell(index, scale, parentPosition, parentOrientation, direction, parentType);
            }
            if (this.get("freeformCellType") == "octa") return new DMAFreeFormOctaCell(index, scale, parentPosition, parentOrientation, direction, parentType);
            return new DMAFreeFormTetraCell(index, scale, parentPosition, parentOrientation, direction, parentType);
        },

        getIndexForPosition: function(absPosition){//only used by baseplane
            var scale = this.get("scale");
            var yIndex = Math.floor(absPosition.y/this.yScale(scale));
            if (yIndex%2 != 0) absPosition.x += this.xScale(scale)/2;
            var index = this._indexForPosition(absPosition);
            if (index.z%2 == 1) index.y += 1;
            return index;
        },

        getPositionForIndex: function(index){//only used by baseplane
            var scale = this.get("scale");
            var position = _.clone(index);
            var xScale = this.xScale(scale);
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale(scale)+scale/Math.sqrt(3)/2;
            position.z = (position.z+0.5)*this.zScale(scale);
            if ((index.y%2) != 0) position.x -= this.xScale(scale)/2;
            return position;
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            var colSep = this.get("columnSeparation");
            return scale*(1+2*colSep);
        },

        yScale: function(scale){
            return this.xScale(scale)/2*Math.sqrt(3);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            if (this.get("freeformCellType") == "octa") return 2*scale/Math.sqrt(6);
            return 2*scale/Math.sqrt(24);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            this.set("freeformCellType", null);
            this.clearCells();
            _.each(_.keys(this.OctaFreeFormFaceLattice), function(key){
                self[key] = null;
            });
        }

    },

////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////EDGE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    OctaEdgeLattice: {

        _initLatticeType: function(){

            //bind events
            this.set("columnSeparation", 0.0);
//            this.listenTo(this, "change:columnSeparation", this._changeColSeparation);

            this.set("basePlane", new OctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaEdgeHighlighter({scale:this.get("scale")}));

        },

        getIndexForPosition: function(absPosition){
            //todo finish this
            var scale = this.get("scale");
            var yIndex = Math.floor(absPosition.y/this.yScale(scale));
            if (yIndex%2 != 0) absPosition.x += this.xScale(scale)/2;
            var yScale = scale/Math.sqrt(3);
            var index = this._indexForPosition(absPosition);
            if (index.z%3 == 1) {
                absPosition.x -= this.xScale(scale)/2;
                absPosition.y += yScale/2;
            } else if (index.z%3 == 2){
                absPosition.y += yScale;
            }
            var index = this._indexForPosition(absPosition);
            return index;
        },

        getPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);
            var xScale = this.xScale(scale);
            var yScale = scale/Math.sqrt(3);
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale(scale)+yScale/2;
            position.z = (position.z+0.5)*this.zScale(scale);
            if (index.y%2 != 0) position.x -= this.xScale(scale)/2;
            if (index.z%3 == 1) {
                position.x += this.xScale(scale)/2;
                position.y -= yScale/2;
            } else if (index.z%3 == 2){
                position.y -= yScale;
            }
            return position;
        },

        _makeCellForLatticeType: function(indices, scale){
            this._addInverseCellsForIndex(indices);
            return new DMAEdgeOctaCell(indices, scale);
        },

        _makeInvCellForLatticeType: function(indices, scale){
            return new DMATetraEdgeCell(indices, scale);
        },

        getInvCellPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);

            var oddZ = position.z%2 != 0;
            position.z = Math.floor(position.z/2);
            var yScale = scale/Math.sqrt(3);

            if (oddZ){
                position.x = (position.x)*this.xScale(scale);
                position.y = position.y*this.yScale(scale);
            } else {
                position.x = (position.x+0.5)*this.xScale(scale);
                position.y = (position.y)*this.yScale(scale)-yScale/2;
            }

            if (oddZ){
                position.z = (position.z + 1)*this.zScale(scale);
            } else {
                position.z = (position.z)*this.zScale(scale);
            }

            if ((index.y%2) != 0) {
                if (oddZ){
                    position.x += this.xScale(scale)/2;
                } else {
                    position.x -= this.xScale(scale)/2;
                }
            }

            var zLayer = Math.floor(index.z/2)%3;
            if (zLayer == 1) {
                position.x += this.xScale(scale)/2;
                position.y -= yScale/2;
            } else if (zLayer == 2){
                position.y -= yScale;
            }

            return position;
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaEdgeLattice), function(key){
                self[key] = null;
            });
            _.each(_.keys(this.OctaFaceLattice), function(key){
                self[key] = null;
            });
        }

    },

    OctaRotEdgeLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaVertexHighlighter({scale:this.get("scale")}));

        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        _makeCellForLatticeType: function(indices, scale){
//            this._addInverseCellsForIndex(indices);
            return new DMAVertexOctaCell(indices, scale);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*Math.sqrt(2);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaRotEdgeLattice), function(key){
                self[key] = null;
            });
        }

    },


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////VERTEX CONN OCTA LATTICE//////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    OctaVertexLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaVertexHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        getInvCellPositionForIndex: function(index){

            var position = this._positionForIndex(index);

            var scale = this.get("scale");
            position.x -= this.xScale(scale)/2;
            position.y -= this.yScale(scale)/2;
            position.z -= this.zScale(scale)/2;
            return position;
        },

        _inverseIndicesToAdd: function(index){
            return [
                this._add(index, {x:0,y:0,z:0}),
                this._add(index, {x:0,y:1,z:0}),
                this._add(index, {x:1,y:0,z:0}),
                this._add(index, {x:1,y:1,z:0}),

                this._add(index, {x:0,y:0,z:1}),
                this._add(index, {x:0,y:1,z:1}),
                this._add(index, {x:1,y:0,z:1}),
                this._add(index, {x:1,y:1,z:1})
            ];
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*Math.sqrt(2);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
        },

        _makeCellForLatticeType: function(indices, scale){
            this._addInverseCellsForIndex(indices);
            return new DMAVertexOctaCell(indices, scale);
        },

        _makeInvCellForLatticeType: function(indices, scale){
            return new DMATruncCubeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaVertexLattice), function(key){
                self[key] = null;
            });
        }

    },



////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////CUBE LATTICE//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    CubeLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new CubeHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale;
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
        },

        _makeCellForLatticeType: function(indices, scale){
            return new DMACubeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.CubeLattice), function(key){
                self[key] = null;
            });
        }

    }

});