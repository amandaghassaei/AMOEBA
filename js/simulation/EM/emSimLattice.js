/**
 * Created by ghassaei on 2/27/16.
 */


define(['underscore', 'backbone', 'threeModel', 'lattice', 'plist', 'three', 'emWire', 'GPUMath'],
    function(_, Backbone, three, lattice, plist, THREE, EMWire, gpuMath) {

        var EMSimLattice = Backbone.Model.extend({

            defaults: {
               wires: {},
               signals: [],
               signalConflict: false
            },

            initialize: function(){
                //this.listenTo(this, "change:wires", this._assignSignalsToWires);
            },

            setCells: function(cells, fixedIndices){

                var numCells = lattice.get("numCells");
                if (numCells == 0){
                    console.warn("no cells");
                    return;
                }

                var textureDim = this._calcTextureSize(numCells);//calc size of texture for pow of two
                var textureSize = textureDim*textureDim;

                this.textureSize = [textureDim, textureDim];
                this.originalPosition = new Float32Array(textureSize*4);
                this.translation = new Float32Array(textureSize*4);
                this.lastTranslation = new Float32Array(textureSize*4);
                this.velocity = new Float32Array(textureSize*4);
                this.lastVelocity = new Float32Array(textureSize*4);
                this.cellsArrayMapping = new Int16Array(textureSize*4);//holds lattice index of cell (for rendering from texture)

                this.fixed = new Uint8Array(textureSize*4);
                this.mass = new Float32Array(textureSize*4);

                this.neighborsXMapping = new Int16Array(textureSize*8);//-1 equals no neighb
                this.neighborsYMapping = new Int16Array(textureSize*8);
                this.compositeKs = new Float32Array(textureSize*8);
                this.compositeDs = new Float32Array(textureSize*8);

                this.cellsIndexMapping = this._initEmptyArray(cells);//3d array holds rgba index of cell (for use within this class)
                var cellsMin = lattice.get("cellsMin");

                var index = 0;
                var self = this;
                this._loopCells(cells, function(cell, x, y, z){

                    var rgbaIndex = 4*index;

                    var position = cell.getAbsolutePosition();
                    self.originalPosition[rgbaIndex] = position.x;
                    self.originalPosition[rgbaIndex+1] = position.y;
                    self.originalPosition[rgbaIndex+2] = position.z;

                    self.cellsArrayMapping[rgbaIndex] = x;
                    self.cellsArrayMapping[rgbaIndex+1] = y;
                    self.cellsArrayMapping[rgbaIndex+2] = z;

                    self.mass[rgbaIndex] = self._calcCellMass(cell);

                    self.cellsIndexMapping[x][y][z] = index;

                    index++;
                });

                index = 0;
                this._loopCellsWithNeighbors(cells, function(cell, neighbors, x, y, z){

                    _.each(neighbors, function(neighbor, neighborIndex){

                        var compositeIndex = index*8;
                        if (neighborIndex > 2) compositeIndex += 4;

                        if (!neighbor) {
                            self.neighborsXMapping[compositeIndex + neighborIndex%3] = -1;
                            self.neighborsYMapping[compositeIndex + neighborIndex%3] = -1;
                            return;
                        }

                        var neighborIndex3D = neighbor.getAbsoluteIndex().sub(cellsMin);
                        var neighborMappingIndex1D = self.cellsIndexMapping[neighborIndex3D.x][neighborIndex3D.y][neighborIndex3D.z];
                        self.neighborsXMapping[compositeIndex + neighborIndex%3] = neighborMappingIndex1D%textureDim;
                        self.neighborsYMapping[compositeIndex + neighborIndex%3] = parseInt(neighborMappingIndex1D/textureDim);

                        var compositeK = self._calcCompositeParam(self._getCellK(cell), self._getCellK(neighbor));

                        self.compositeKs[compositeIndex + neighborIndex%3] = compositeK;
                        self.compositeDs[compositeIndex + neighborIndex%3] = compositeK/1000;//this is arbitrary for now
                    });

                    index++;
                });

                var change = false;
                for (var i=fixedIndices.length-1;i>=0;i--){
                    var fixedIndex = fixedIndices[i];
                    var latticeIndex = fixedIndex.clone().sub(cellsMin);
                    var cell = cells[latticeIndex.x][latticeIndex.y][latticeIndex.z];
                    if (cell) {
                        var rgbaIndex = 4*(this.cellsIndexMapping[latticeIndex.x][latticeIndex.y][latticeIndex.z]);
                        this.fixed[rgbaIndex] = 1;
                    } else {//remove from fixedIndices
                        fixedIndices.splice(i, 1);
                        change = true;
                    }
                }

                if (change) require(['emSim'], function(emSim){
                    emSim.trigger("change");//fixed indices or signals has changed
                });

            },

            _calcTextureSize: function(numCells){
                if (numCells == 1) return 2;
                for (var i=0;i<numCells;i++){
                    if (Math.pow(2, 2*i) >= numCells){
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

            isFixedAtIndex: function(index){
                var rgbaIndex = 4*(this.cellsIndexMapping[index.x][index.y][index.z]);
                return this.fixed[rgbaIndex];
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

            fixCellAtIndex: function(index){
                var rgbaIndex = 4*this.cellsIndexMapping[index.x][index.y][index.z];
                var state = this.fixed[rgbaIndex];
                this.fixed[rgbaIndex] = !state;
                //todo update gpu texture
                return !state;
            },

            iter: function(dt, time, gravity, shouldRender){

                var textureSize = this.textureSize[0]*this.textureSize[1];
                for (var i=0;i<textureSize;i++){

                    var rgbaIndex = i*4;
                    if (this.fixed[rgbaIndex]) continue;
                    var mass = this.mass[rgbaIndex];
                    if (mass == 0) continue;
                    var force = [mass*gravity.x, mass*gravity.y, mass*gravity.z];

                    var translation = [this.lastTranslation[rgbaIndex], this.lastTranslation[rgbaIndex+1], this.lastTranslation[rgbaIndex+2]];
                    var velocity = [this.lastVelocity[rgbaIndex], this.lastVelocity[rgbaIndex+1], this.lastVelocity[rgbaIndex+2]];

                    for (var j=0;j<6;j++){

                        var neighborsIndex = i*8;
                        if (j>2) neighborsIndex += 4;
                        if (this.neighborsXMapping[neighborsIndex + j%3] < 0) continue;
                        var neighborIndex = 4*(this.neighborsXMapping[neighborsIndex + j%3] + this.textureSize[0]*this.neighborsYMapping[neighborsIndex + j%3]);
                        var neighborTranslation = [this.lastTranslation[neighborIndex], this.lastTranslation[neighborIndex+1], this.lastTranslation[neighborIndex+2]];
                        var neighborVelocity = [this.lastVelocity[neighborIndex], this.lastVelocity[neighborIndex+1], this.lastVelocity[neighborIndex+2]];

                        var k = this.compositeKs[neighborsIndex + j%3];
                        var d = 0.01;//this.compositeDs[neighborsIndex + j%3];

                        force[0] += k*(neighborTranslation[0]-translation[0]) + d*(neighborVelocity[0]-velocity[0]);
                        force[1] += k*(neighborTranslation[1]-translation[1]) + d*(neighborVelocity[1]-velocity[1]);
                        force[2] += k*(neighborTranslation[2]-translation[2]) + d*(neighborVelocity[2]-velocity[2]);
                    }

                    var acceleration = [force[0]/mass, force[1]/mass, force[2]/mass];
                    velocity = [velocity[0] + acceleration[0]*dt, velocity[1] + acceleration[1]*dt, velocity[2] + acceleration[2]*dt];
                    translation  = [translation[0] + velocity[0]*dt, translation[1] + velocity[1]*dt, translation[2] + velocity[2]*dt];

                    this.translation[rgbaIndex] = translation[0];
                    this.translation[rgbaIndex+1] = translation[1];
                    this.translation[rgbaIndex+2] = translation[2];

                    this.velocity[rgbaIndex] = velocity[0];
                    this.velocity[rgbaIndex+1] = velocity[1];
                    this.velocity[rgbaIndex+2] = velocity[2];
                }

                if (shouldRender){
                    var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);
                    var cells = lattice.getCells();
                    for (var i=0;i<textureSize;i++) {

                        var rgbaIndex = i*4;
                        if (this.mass[rgbaIndex] == 0) continue;//no cell here

                        var translation = [this.translation[rgbaIndex], this.translation[rgbaIndex+1], this.translation[rgbaIndex+2]];
                        var index = [this.cellsArrayMapping[rgbaIndex], this.cellsArrayMapping[rgbaIndex+1], this.cellsArrayMapping[rgbaIndex+2]];

                        var position = [this.originalPosition[rgbaIndex], this.originalPosition[rgbaIndex+1], this.originalPosition[rgbaIndex+2]];

                        position[0] += multiplier*translation[0];
                        position[1] += multiplier*translation[1];
                        position[2] += multiplier*translation[2];

                        cells[index[0]][index[1]][index[2]].object3D.position.set(position[0], position[1], position[2]);
                    }
                }

                this._swapArrays("velocity", "lastVelocity");
                this._swapArrays("translation", "lastTranslation");
            },

            _swapArrays: function(array1Name, array2Name){
                var temp = this[array1Name];
                this[array1Name] = this[array2Name];
                this[array2Name] = temp;
            },

            reset: function(){
                var textureSize = this.textureSize[0]*this.textureSize[1];
                var cells = lattice.getCells();
                for (var i=0;i<textureSize;i++) {

                    var rgbaIndex = i*4;
                    if (this.mass[rgbaIndex] == 0) continue;//no cell here

                    var index = [this.cellsArrayMapping[rgbaIndex], this.cellsArrayMapping[rgbaIndex+1], this.cellsArrayMapping[rgbaIndex+2]];
                    var position = [this.originalPosition[rgbaIndex], this.originalPosition[rgbaIndex+1], this.originalPosition[rgbaIndex+2]];
                    cells[index[0]][index[1]][index[2]].object3D.position.set(position[0], position[1], position[2]);
                }

                this.lastTranslation = new Float32Array(textureSize*4);
                this.lastVelocity = new Float32Array(textureSize*4);

            }

        });


        return new EMSimLattice();


    });