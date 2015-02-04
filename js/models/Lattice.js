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

        this.set("basePlane", new BasePlane({cellType:this.get("cellType"),
            connectionType:this.get("connectionType"),
            scale:this.get("scale")}));
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////ADD/REMOVE CELLS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    addCellAtPosition: function(absPosition){

        //calc indices in cell matrix
        var scale = this.get("scale");
        var octHeight = 2*scale/Math.sqrt(6);
        var triHeight = scale/2*Math.sqrt(3);
        var position = {};
        position.x = Math.round(absPosition.x/scale);
        position.y = Math.round(absPosition.y/triHeight);
        position.z = Math.round(absPosition.z/octHeight);
        if (position.z%2 == 1) position.y += 1;

        this.addCellAtIndex(position);
    },

    addCellAtIndex: function(indices){

        var cells = this.get("cells");
        var scale = this.get("scale");

        //check for matrix expansion
        var lastMax = this.get("cellsMax");
        var lastMin = this.get("cellsMin");
        var newMax = this._updateCellsMax(indices, lastMax);
        var newMin = this._updateCellsMin(indices, lastMin);
        if (newMax) {
            this._expandCellsArray(cells, this._subtract(newMax, lastMax), false);
            this.set("cellsMax", newMax);
        }
        if (newMin) {
            this._expandCellsArray(cells, this._subtract(lastMin, newMin), true);
            this.set("cellsMin", newMin);
        }

        var index = this._subtract(indices, this.get("cellsMin"));
        if (!cells[index.x][index.y][index.z]) cells[index.x][index.y][index.z] = new DMACell(this.get("cellMode"), indices, scale, this);
        else console.warn("already a cell there");
        this.set("numCells", this.get("numCells")+1);
        window.three.render();
    },

    removeCell: function(cell){
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
    ///////////////////////////////CELLS ARRAY//////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

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