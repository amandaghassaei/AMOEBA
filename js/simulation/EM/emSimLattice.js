/**
 * Created by ghassaei on 2/27/16.
 */


define(['underscore', 'backbone', 'threeModel', 'lattice', 'three', 'emWire', 'GPUMath'],
    function(_, Backbone, three, lattice, THREE, EMWire, gpuMath) {

        var EMSimLattice = Backbone.Model.extend({

            defaults: {
               wires: {},
               signals: [],
               signalConflict: false
            },

            initialize: function(){
                //this.listenTo(this, "change:wires", this._assignSignalsToWires);
            },

            setCells: function(cells){

                var numCells = lattice.get("numCells");
                if (numCells == 0){
                    console.warn("no cells");
                    return;
                }

                var textureDim = this._calcTextureSize(numCells);//calc size of texture for pow of two
                var textureSize = textureDim*textureDim;

                this.translation = new Float32Array(textureSize*4);
                this.lastTranslation = new Float32Array(textureSize*4);
                this.velocity = new Float32Array(textureSize*4);
                this.lastVelocity = new Float32Array(textureSize*4);
                this.cellsArrayMapping = new Int16Array(textureSize*4);

                this.fixed = new Uint8Array(textureSize*4);
                this.mass = new Float32Array(textureSize*4);

                this.neighborsXMapping = new Int16Array(textureSize*8);
                this.neighborsYMapping = new Int16Array(textureSize*8);
                this.compositeKs = new Float32Array(textureSize*8);
                this.compositeDs = new Float32Array(textureSize*8);

                var neighborMapping = this._initEmptyArray(cells);
                var cellsMin = lattice.get("cellsMin");

                var index = 0;
                var self = this;
                this._loopCells(cells, function(cell, x, y, z){

                    var rgbaIndex = 4*index;

                    var position = cell.getAbsolutePosition();
                    self.lastTranslation[rgbaIndex] = position.x;
                    self.lastTranslation[rgbaIndex+1] = position.y;
                    self.lastTranslation[rgbaIndex+2] = position.z;

                    var cellIndex = cell.getAbsoluteIndex();
                    self.cellsArrayMapping[rgbaIndex] = cellIndex.x;
                    self.cellsArrayMapping[rgbaIndex+1] = cellIndex.y;
                    self.cellsArrayMapping[rgbaIndex+2] = cellIndex.z;

                    self.mass[rgbaIndex] = self._calcCellMass(cell);

                    //todo fixed

                    neighborMapping[x][y][z] = index;

                    index++;
                });

                index = 0;
                this._loopCellsWithNeighbors(cells, function(cell, neighbors, x, y, z){

                    _.each(neighbors, function(neighbor, neighborIndex){

                        if (!neighbor) return;

                        var compositeIndex = index*8;
                        if (neighborIndex > 2) compositeIndex += 4;

                        var neighborIndex3D = neighbor.getAbsoluteIndex().sub(cellsMin);
                        var neighborMappingIndex1D = neighborMapping[neighborIndex3D.x][neighborIndex3D.y][neighborIndex3D.z];
                        self.neighborsXMapping[compositeIndex + neighborIndex%3] = 4*(neighborMappingIndex1D%textureDim);
                        self.neighborsYMapping[compositeIndex + neighborIndex%3] = parseInt(neighborMappingIndex1D/textureDim);

                        var compositeK = self._calcCompositeParam(self._getCellK(cell), self._getCellK(neighbor));

                        self.compositeKs[compositeIndex + neighborIndex%3] = compositeK;
                        self.compositeDs[compositeIndex + neighborIndex%3] = compositeK/100;//this is arbitrary for now
                    });

                    index++;
                });

            },

            _calcTextureSize: function(numCells){
                for (var i=0;i<numCells;i++){
                    if (Math.pow(2, 2*i) > numCells){
                        return Math.pow(2, i);
                    }
                }
                console.warn("no texture size found for " + numCells + " cells");
                return 0;
            },

            _initEmptyArray: function(cells){
                var array3D = [];
                for (var x=0;x<cells.length;x++){
                    var array2D = [];
                    for (var y=0;y<cells[0].length;y++){
                        var array1D = [];
                        for (var z=0;z<cells[0][0].length;z++){
                            array1D.push(null);
                        }
                        array2D.push(array1D);
                    }
                    array3D.push(array2D);
                }
                return array3D;
            },

            _calcCellMass: function(cell){
                var material = cell.getMaterial();
                var cellSize = lattice.getPitch();
                var cellVolume = cellSize.x * cellSize.y * cellSize.z;
                return material.getDensity()*cellVolume;//kg
            },

            _getCellK: function(cell){
                return cell.getMaterial().getK();
            },

            _calcCompositeParam: function(param1, param2){
                if (param1 == param2) return param1;
                return 2*param1*param2/(param1+param2);
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

            _loopCellsWithNeighbors: function(cells, callback){
                var sizeX = cells.length;
                var sizeY = cells[0].length;
                var sizeZ = cells[0][0].length;
                this._loopCells(cells, function(cell, x, y, z, self){
                    var neighbors = self._calcNeighbors(cells, x, y, z, sizeX, sizeY, sizeZ);
                    callback(cell, neighbors, x, y, z, self);
                });
            },

            _calcNeighbors: function(cells, x, y, z, sizeX, sizeY, sizeZ){
                var neighbors = [];
                if (x == 0) neighbors.push(null);
                else neighbors.push(cells[x-1][y][z]);
                if (x == sizeX-1) neighbors.push(null);
                else neighbors.push(cells[x+1][y][z]);

                if (y == 0) neighbors.push(null);
                else neighbors.push(cells[x][y-1][z]);
                if (y == sizeY-1) neighbors.push(null);
                else neighbors.push(cells[x][y+1][z]);

                if (z == 0) neighbors.push(null);
                else neighbors.push(cells[x][y][z-1]);
                if (z == sizeZ-1) neighbors.push(null);
                else neighbors.push(cells[x][y][z+1]);

                return neighbors;
            },

            iter: function(){

            },

            reset: function(){

            }

        });


        return new EMSimLattice();


    });