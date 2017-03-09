/**
 * Created by ghassaei on 10/11/16.
 */


define(["backbone", "three", "threeModel", "Cell"], function(Backbone, THREE, three, Cell){

    var Lattice = Backbone.Model.extend({
        defaults: {
            scaleMultiplier: 1,
            scale: new THREE.Vector3(1,1,1),
            units: "mm",
            aspectRatio: new  THREE.Vector3(1,1,1),
            cellsMin: null,
            cellsMax: null,
            numCells: 0
        },

        initialize: function(){
            this.cells = [[[null]]];

            this.listenTo(this, "change:aspectRatio", this._aspectRatioChanged);
            this.listenTo(this, "change:aspectRatio change:scaleMultiplier", this._updateScale);
        },

        getScale: function(){//only used in sim
            return this.get("scale").clone();
        },

        getAspectRatio: function(){
            return this.get("aspectRatio").clone();
        },

        _aspectRatioChanged: function(){
            var aspectRatio = this.getAspectRatio();
            this._loopCells(this.cells, function(cell){
                cell.updateForAspectRatio(aspectRatio);
            });
            three.render();
        },

        _updateScale: function(){
            this.set("scale", this.get("aspectRatio").clone().multiplyScalar(this.get("scaleMultiplier")));
        },

        deleteCellAtIndex: function(index){
            var cellIndex = index.clone().sub(this.get("cellsMin"));
            var cell = this.cells[cellIndex.x][cellIndex.y][cellIndex.z];
            cell.destroy(true);
            this.cells[cellIndex.x][cellIndex.y][cellIndex.z] = null;
            this._checkForMatrixContraction();
            this.set("numCells", this.get("numCells")-1);
            three.render();
        },

        addCellAtIndex: function(index){
            if (this._checkForIndexOutsideBounds(index)) this._expandCellsMatrix(index, index);
            var cell = new Cell({scale:this.getAspectRatio(), index:index});
            var cellIndex = index.clone().sub(this.get("cellsMin"));
            this.cells[cellIndex.x][cellIndex.y][cellIndex.z] = cell;
            this.set("numCells", this.get("numCells")+1);
            three.render();
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

        _expandCellsMatrix: function(indicesMax, indicesMin){

            var lastMax = this.get("cellsMax");
            var lastMin = this.get("cellsMin");

            if (!lastMax || !lastMin){
                this.set("cellsMax", indicesMax);
                this.set("cellsMin", indicesMin);
                var size = indicesMax.clone().sub(indicesMin);
                this._expandArray(this.cells, size, false);
                return;
            }

            indicesMax = indicesMax.clone().max(lastMax);
            indicesMin = indicesMin.clone().min(lastMin);
            if (!indicesMax.equals(lastMax)) {
                var size = indicesMax.clone().sub(lastMax);
                this._expandArray(this.cells, size, false);
                this.set("cellsMax", indicesMax);
            }
            if (!indicesMin.equals(lastMin)) {
                var size = lastMin.clone().sub(indicesMin);
                this._expandArray(this.cells, size, true);
                this.set("cellsMin", indicesMin);
            }
        },

        _expandArray: function(cells, expansion, fromFront){

            _.each(expansion, function(expansionVal, key){
                if (expansionVal == 0) return;//no expansion on this axis

                var cellsX = cells.length;
                var cellsY = cells[0].length;
                var cellsZ = cells[0][0].length;

                if (key=="x"){
                    for (var x=0;x<expansionVal;x++){
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
                        for (var y=0;y<expansionVal;y++){
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
                            for (var z=0;z<expansionVal;z++){
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
            this._contractCellsArray(this.cells, true, minDiff);

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

        _contractCellsArray: function(cells, fromFront, contractionSize) {
            for (var x = 0; x < contractionSize.x; x++) {
                if (cells.length == 1) {
                    console.warn("nothing left to delete");
                    return;
                }
                if (fromFront) cells.shift();
                else cells.pop();
            }
            _.each(cells, function (cellLayer) {
                for (var y = 0; y < contractionSize.y; y++) {
                    if (fromFront) cellLayer.shift();
                    else cellLayer.pop();
                }
                for (var z = 0; z < contractionSize.z; z++) {
                    _.each(cellLayer, function (cellColumn) {
                        if (fromFront) cellColumn.shift();
                        else cellColumn.pop();
                    });
                }
            });
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

        clearCells: function(){
            console.log("clear");
        },

        getAssemblySaveData: function(){
            return this.cells;
        }

    });
    return new Lattice();
});