/**
 * Created by aghassaei on 1/16/15.
 */


Lattice = Backbone.Model.extend({

    defaults: {
        scale: window.defaultLatticeScale,
        cellType: "octa",
        connectionType: "face",
        allCellTypes: {octa:"Octahedron", cube:"Cube"},
        allConnectionTypes: {
            octa: {face:"Face", edge:"Edge", vertex:"Vertex"},
            cube: {face:"Face"}
        },
        allPartTypes:{
            octa:{
                face: {triangle:"Triangle"},
                edge: {triangle:"Triangle"},
                vertex:{square:"Square", xShape:"X"}
            },
            cube:{
                face: null
            }
        },
        nodes: [],
        cells: [[[null]]],//3D matrix containing all cells and null, dynamic size
        inverseCells: [[[null]]],//3d matrix containing all inverse cells and null, dynamic size
        cellsMin: {x:0, y:0, z:0},//min position of cells matrix
        cellsMax: {x:0, y:0, z:0},//max position of cells matrix
        numCells: 0,
        partType: "triangle",
        cellMode: "cell",
        basePlane: null//plane to build from
    },

    //pass in fillGeometry

    initialize: function(){

        //bind events
        this.listenTo(this, "change:cellMode", this._cellModeDidChange);
        this.listenTo(this, "change:scale", this._scaleDidChange);
        this.listenTo(this, "change:cellType change:connectionType", this._changeLatticeStructure);

        this._initialize();//call subclass init
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////ADD/REMOVE CELLS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    addCellsInRange: function(range){//add a block of cells
        var scale = this.get("scale");
        var cells = this.get("cells");
        this._checkForMatrixExpansion(cells, range.max, range.min);

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
        window.three.render();
    },

    addCellAtIndex: function(indices){

        var scale = this.get("scale");
        var cells = this.get("cells");
        this._checkForMatrixExpansion(cells, indices, indices);

        var index = this._subtract(indices, this.get("cellsMin"));
        if (!cells[index.x][index.y][index.z]) {
            cells[index.x][index.y][index.z] = this._makeCellForLatticeType(indices, scale);
            this.set("numCells", this.get("numCells")+1);
            window.three.render();
        } else console.warn("already a cell there");

    },

    removeCell: function(cell){
        if (!cell) return;
        var index = this._subtract(cell.indices, this.get("cellsMin"));
        var cells = this.get("cells");
        cell.destroy();
        cells[index.x][index.y][index.z] = null;

        //todo shrink cells matrix if needed

        this.set("numCells", this.get("numCells")-1);
        window.three.render();
    },

    clearCells: function(){
        this._iterCells(this.get("cells"), function(cell){
            if (cell) cell.destroy();
        });
        this.set("cells", [[[null]]]);
        this.set("cellsMax", {x:0, y:0, z:0});
        this.set("cellsMin", {x:0, y:0, z:0});
        this.set("nodes", []);
        this.set("numCells", 0);
        this.get("basePlane").set("zIndex", 0);
        window.three.render();
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////FILL GEOMETRY////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    subtractMesh: function(mesh){

        var scale = this.getScale();
        var yscale = scale/2*Math.sqrt(3);
        var zScale = this.get("scale")*2/Math.sqrt(6);

        var cells = this.get("cells");
        var cellsMin = this.get("cellsMin");

        var allVertexPos = mesh.geometry.attributes.position.array;

        var zHeight;
        for (var x=0;x<cells.length;x++){
            for (var y=0;y<cells[0].length;y++){
                var firstCell = null;
                for (var z=0;z<cells[0][0].length;z++){
                    firstCell = cells[x][y][z];
                    if (firstCell) break;
                }
                if (!firstCell) continue;//nothing in col

                var origin = firstCell._calcPosition(0, this._add({x:x,y:y,z:z}, cellsMin));
                zHeight = this._findIntersectionsInWindow(scale/2, yscale/2, origin, allVertexPos) || zHeight;

//                if (!zHeight) zHeight = this._findIntersectionsInWindow(scale, yscale, origin, allVertexPos);
//                if (!zHeight) zHeight = this._findIntersectionsInWindow(scale, 4*yscale, 4*origin, allVertexPos);

                zHeight = Math.floor(zHeight/zScale);
                for (var z=0;z<zHeight;z++){
                    var cell = cells[x][y][z];
                    if (cell) cell.destroy();
                    cells[x][y][z] = null;
                }
            }

        }
        console.log("done");
        window.three.render();
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

    _checkForMatrixExpansion: function(cells, indicesMax, indicesMin){

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

    _subtract: function(pos1, pos2){
        return {x:pos1.x-pos2.x, y:pos1.y-pos2.y, z:pos1.z-pos2.z};
    },

    _add: function(pos1, pos2){
        return {x:pos1.x+pos2.x, y:pos1.y+pos2.y, z:pos1.z+pos2.z};
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////EVENTS//////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    _cellModeDidChange: function(){
        var mode = this.get("cellMode");
        this._iterCells(this.get("cells"), function(cell){
            if (cell && cell.drawForMode) cell.drawForMode(mode);
        });
        window.three.render();
    },

    _scaleDidChange: function(){
        var scale = this.get("scale");
        this.get("basePlane").updateScale(scale);
        this._iterCells(this.get("cells"), function(cell){
            if (cell) cell.updateForScale(scale);
        });
        window.three.render();
    },

    previewScaleChange: function(scale){
        this.get("basePlane").updateScale(scale);
    },

    _changeLatticeStructure: function(){
        this.clearCells();
        this.get("basePlane").updateGeometry(this.get("cellType"), this.get("connectionType"), this.get("scale"));
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
    }

});


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////FACE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


OctaFaceLattice = Lattice.extend({

//    defaults: {
//        columnSeparation: 0.2//% column separation
//    },

    _initialize: function(){

        //bind events
        this.listenTo(this, "change:columnSeparation", this._changeColSeparation);

        this.set("basePlane", new OctaBasePlane({cellType:this.get("cellType"),
            connectionType:this.get("connectionType"),
            scale:this.get("scale")}));
        this.set("columnSeparation", 0.0);
    },

    getScale: function(){
        return this.get("scale")*(1.0+2*this.get("columnSeparation"));
    },

    _changeColSeparation: function(){
        var colSep = this.get("columnSeparation");
        var scale = this.get("scale");
        this.get("basePlane").updateColSeparation(colSep);
        this._iterCells(this.get("cells"), function(cell){
            if (cell) cell.updateForScale(scale);
        });
        window.three.render();
    },

    addCellAtPosition: function(absPosition){

        //calc indices in cell matrix
        var scale = this.get("scale");
        var colSep = this.get("columnSeparation");
        var latticeScale = scale*(1+2*colSep);
        var octHeight = 2*scale/Math.sqrt(6);
        var triHeight = latticeScale/2*Math.sqrt(3);
        var position = {};
        position.x = Math.round(absPosition.x/latticeScale);
        position.y = Math.round(absPosition.y/triHeight);
        position.z = Math.round(absPosition.z/octHeight);
        if (position.z%2 == 1) position.y += 1;

        this.addCellAtIndex(position);
    },

    _makeCellForLatticeType: function(indices, scale){
        return new DMASideOctaCell(this.get("cellMode"), indices, scale, this);
    }

});

////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////EDGE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////VERTEX CONN OCTA LATTICE//////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////CUBE LATTICE//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////