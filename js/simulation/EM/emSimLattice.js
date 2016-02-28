/**
 * Created by ghassaei on 2/27/16.
 */


define(['underscore', 'backbone', 'threeModel', 'lattice', 'plist', 'emSimCell', 'emWire', 'GPUMath', "text!simulation/shaders/vertexShader.js",
    "text!simulation/EM/shaders/velocityCalcShader.js", "text!simulation/EM/shaders/packToBytesShader.js"],
    function(_, Backbone, three, lattice, plist, emSimCell, EMWire, gpuMath, vertexShader, velocityCalcShader, packToBytesShader) {

        var EMSimLattice = Backbone.Model.extend({

            defaults: {
                wires: {},
                signals: [],
                signalConflict: false,
                actuators: []
            },

            initialize: function(){
                this.listenTo(this, "change:wires", this._assignSignalsToWires);
            },

            setCells: function(cells, fixedIndices){

                console.log("set cells");

                var numCells = lattice.get("numCells");
                if (numCells == 0){
                    console.warn("no cells");
                    return;
                }

                var self = this;

                var textureDim = this._calcTextureSize(numCells);//calc size of texture for pow of two
                var textureSize = textureDim*textureDim;

                this._precomputeSignals(cells);
                this._precomputeWires(cells);

                this.textureSize = [textureDim, textureDim];
                this.originalPosition = new Float32Array(textureSize*4);
                this.translation = new Float32Array(textureSize*4);
                this.lastTranslation = new Float32Array(textureSize*4);
                this.velocity = new Float32Array(textureSize*4);
                this.lastVelocity = new Float32Array(textureSize*4);

                this.quaternion = new Float32Array(textureSize*4);
                this.lastQuaternion = new Float32Array(textureSize*4);
                this.rotation = new Float32Array(textureSize*4);
                this.lastRotation = new Float32Array(textureSize*4);

                this.cellsArrayMapping = new Int16Array(textureSize*4);//holds lattice index of cell (for rendering from texture)

                this.fixed = new Float32Array(textureSize*4);//todo uint8
                this.mass = new Float32Array(textureSize*4);

                this.neighborsXMapping = new Int16Array(textureSize*8);//-1 equals no neighb
                this.neighborsYMapping = new Int16Array(textureSize*8);
                this.compositeKs = new Float32Array(textureSize*8);
                this.compositeDs = new Float32Array(textureSize*8);

                this.wires = new Int16Array(textureSize*4);//also stores actuator mask as -1
                var wires = this.get("wires");
                this.resetWiresMetaTexture(wires);

                this.cellsIndexMapping = this._initEmptyArray(cells);//3d array holds rgba index of cell (for use within this class)
                var cellsMin = lattice.get("cellsMin");

                var index = 0;
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

                    self.lastQuaternion[rgbaIndex+3] = 1;//quat = (0,0,0,1)

                    if (cell.isConductive()) {
                        var wireID = cell.getWireGroup();
                        var keys = _.keys(wires);
                        var wireIndex = keys.indexOf(""+wireID);//keys are strings
                        if (wireIndex<0) console.warn("invalid wire id " + wireID);
                        self.wires[rgbaIndex] = wireIndex+1;
                    }

                    index++;
                });

                var actuators = [];
                index = 0;
                this._loopCellsWithNeighbors(cells, function(cell, neighbors, x, y, z){

                    var rgbaIndex = 4*index;
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

                    if (cell.isAcutator()){
                        var numNeighboringWires = 0;
                        var wireID = -1;
                        var neighborAxis = -1;
                        _.each(neighbors, function (neighbor, neighborIndex) {
                            if (neighbor && neighbor.isConductive()) {
                                numNeighboringWires++;
                                if (neighborAxis < 0) neighborAxis = Math.floor(neighborIndex/2);
                                else if (Math.floor(neighborIndex/2) != neighborAxis) numNeighboringWires -= 100;//throw wiring error
                                if (wireID < 0) wireID = neighbor.getWireGroup();
                                else if (neighbor.getWireGroup() != wireID) numNeighboringWires -= 100;
                            }
                        });
                        if (numNeighboringWires == 2 && neighborAxis >= 0  && wireID >= 0){
                            self.wires[rgbaIndex] = -1;//-1 indicates actuator mask
                            //use remaining three spots to indicate axial direction and wire group num
                            var keys = _.keys(wires);
                            var wireIndex = keys.indexOf(""+wireID);//keys are strings
                            if (wireIndex<0) console.warn("invalid wire id " + wireID);
                            self.wires[rgbaIndex+neighborAxis+1] = wireIndex+1;
                            actuators.push({cell: cell, valid: true, wireIndex: wireIndex});
                        } else {
                            actuators.push({cell: cell, valid: false});
                            console.warn("invalid actuator wiring");
                        }
                    }


                    index++;
                });

                this.set("actuators", actuators);

                var change = false;
                for (var i=fixedIndices.length-1;i>=0;i--){
                    var fixedIndex = fixedIndices[i];
                    var latticeIndex = fixedIndex.clone().sub(cellsMin);
                    if (cells[latticeIndex.x] && cells[latticeIndex.x][latticeIndex.y] && cells[latticeIndex.x][latticeIndex.y][latticeIndex.z]) {
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

                this._setupGPU(textureDim);

            },

            _setupGPU: function(textureDim){
                gpuMath.reset();

                gpuMath.createProgram("velocityCalc", vertexShader, velocityCalcShader);
                gpuMath.initTextureFromData("u_velocity", textureDim, textureDim, "FLOAT", this.velocity);
                gpuMath.initFrameBufferForTexture("u_velocity");
                gpuMath.initTextureFromData("u_lastVelocity", textureDim, textureDim, "FLOAT", this.lastVelocity);
                //gpuMath.initFrameBufferForTexture("lastVelocity");
                gpuMath.initTextureFromData("u_lastTranslation", textureDim, textureDim, "FLOAT", this.lastTranslation);
                gpuMath.initTextureFromData("u_mass", textureDim, textureDim, "FLOAT", this.mass);
                gpuMath.initTextureFromData("u_fixed", textureDim, textureDim, "FLOAT", this.fixed);

                gpuMath.setUniformForProgram("velocityCalc", "lastVelocity", 0, "1i");
                gpuMath.setUniformForProgram("velocityCalc", "lastTranslation", 1, "1i");
                gpuMath.setUniformForProgram("velocityCalc", "u_mass", 2, "1i");
                gpuMath.setUniformForProgram("velocityCalc", "u_fixed", 3, "1i");
                gpuMath.setUniformForProgram("velocityCalc", "u_textureDim", [textureDim, textureDim], "2f");

                gpuMath.createProgram("packToBytes", vertexShader, packToBytesShader);
                gpuMath.initTextureFromData("outputBytes", textureDim*3, textureDim, "UNSIGNED_BYTE", null);
                gpuMath.initFrameBufferForTexture("outputBytes");
                gpuMath.setUniformForProgram("packToBytes", "u_floatTextureDim", [textureDim, textureDim], "2f");

                gpuMath.setSize(textureDim, textureDim);

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

            _precomputeSignals: function(cells){
                var signals = [];
                this._loopCells(cells, function(cell){
                    if (cell.isSignalGenerator()) {
                        cell.setAsSignalGenerator();
                        signals.push(cell);
                    }
                });
                this.set("signals", signals);
            },

            _assignSignalsToWires: function(){
                var wires = this.get("wires");
                var signalConflict = false;
                _.each(this.get("signals"), function(signal){
                    signalConflict |= wires[signal.getWireGroup()].addSignal(signal);
                });
                this.set("signalConflict", signalConflict);
            },

            _precomputeWires: function(cells){
                var num = 1;
                this._loopCells(cells, function(cell){
                    cell.setWireGroup(num++, true);
                });
                this._loopCellsWithNeighbors(cells, function(cell, neighbors){
                    cell.propagateWireGroup(neighbors);
                });
                this._calcNumberDCConnectedComponents(cells);
            },

            resetWiresMetaTexture: function(wires){
                if (!wires) wires = this.get("wires");
                var wiresMeta = new Float32Array(_.keys(wires).length*4);
                var index = 0;
                _.each(wires, function(wire){
                    var i = index*4;
                    var signal = wire.getSignal();
                    if (!signal) {
                        wiresMeta[i] = -1;//no signal generator on this wire
                        return;
                    }
                    var waveformType = signal.waveformType;
                    if (waveformType == "sine"){
                        wiresMeta[i] = 0;
                    } else if (waveformType == "square"){
                        wiresMeta[i] = 1;
                        wiresMeta[i+3] = signal.pwm
                    } else if (waveformType == "saw"){
                        wiresMeta[i] = 2;
                        if (signal.invertSignal) wiresMeta[i+3] = 1;
                    } else if (waveformType == "triangle"){
                        wiresMeta[i] = 3;
                    }
                    wiresMeta[i+1] = signal.frequency;
                    wiresMeta[i+2] = signal.phase;

                    index++;
                });
                this.wiresMeta = wiresMeta;
            },

            _calcNumberDCConnectedComponents: function(cells){
                var wires = {};
                this._loopCells(cells, function(cell){
                    if (cell.isConductive()) {
                        var groupNum = cell.getWireGroup();
                        if (!wires[groupNum]) wires[groupNum] = new EMWire();
                        wires[groupNum].addCell(cell);
                    }
                });
                this.set("wires", wires);
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

            loopCells: function(callback){
                this._loopCells(lattice.getCells(), callback);
            },

            calcNeighbors: function(index){
                var cells = lattice.getCells();
                var sizeX = cells.length;
                var sizeY = cells[0].length;
                var sizeZ = cells[0][0].length;
                var offset = lattice.get("cellsMin");
                return this._calcNeighbors(cells, index.x-offset.x, index.y-offset.y, index.z-offset.z, sizeX, sizeY, sizeZ);
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

            iter: function(dt, time, gravity, groundHeight, friction, shouldRender){

                var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);

                var latticePitch = lattice.getPitch();
                latticePitch = [latticePitch.x, latticePitch.y, latticePitch.z];

                var textureSize = this.textureSize[0]*this.textureSize[1];

                gpuMath.step("velocityCalc", ["u_lastVelocity", "u_lastTranslation", "u_mass", "u_fixed"], "u_velocity");

                gpuMath.setSize(this.textureSize[0]*3, this.textureSize[1]);
                gpuMath.step("packToBytes", ["u_velocity"], "outputBytes");

                //if (shouldRender) {
                    var pixels = new Uint8Array(textureSize * 12);
                    gpuMath.readPixels(0, 0, this.textureSize[0] * 3, this.textureSize[1], pixels);
                    var parsedPixels = new Float32Array(pixels.buffer);
                    console.log(parsedPixels);
                    gpuMath.setSize(this.textureSize[0], this.textureSize[1]);
                //}
                return;


                for (var i=0;i<textureSize;i++){

                    var rgbaIndex = i*4;
                    if (this.fixed[rgbaIndex] == 1) continue;
                    var mass = this.mass[rgbaIndex];
                    if (mass == 0) continue;
                    var force = [mass*gravity.x, mass*gravity.y, mass*gravity.z];
                    var rTotal = [0,0,0];
                    var rContrib = 0;

                    var translation = [this.lastTranslation[rgbaIndex], this.lastTranslation[rgbaIndex+1], this.lastTranslation[rgbaIndex+2]];
                    var velocity = [this.lastVelocity[rgbaIndex], this.lastVelocity[rgbaIndex+1], this.lastVelocity[rgbaIndex+2]];
                    var quaternion = [this.lastQuaternion[rgbaIndex], this.lastQuaternion[rgbaIndex+1], this.lastQuaternion[rgbaIndex+2], this.lastQuaternion[rgbaIndex+3]];
                    var euler = [this.lastRotation[rgbaIndex], this.lastRotation[rgbaIndex+1], this.lastRotation[rgbaIndex+2]];

                    var wiring = [this.wires[rgbaIndex], this.wires[rgbaIndex+1], this.wires[rgbaIndex+2], this.wires[rgbaIndex+3]];
                    var isActuator = wiring[0] == -1;

                    for (var j=0;j<6;j++){

                        var neighborsIndex = i*8;
                        if (j>2) neighborsIndex += 4;
                        if (this.neighborsXMapping[neighborsIndex + j%3] < 0) continue;

                        var neighborIndex = 4*(this.neighborsXMapping[neighborsIndex + j%3] + this.textureSize[0]*this.neighborsYMapping[neighborsIndex + j%3]);
                        var neighborTranslation = [this.lastTranslation[neighborIndex], this.lastTranslation[neighborIndex+1], this.lastTranslation[neighborIndex+2]];
                        var neighborVelocity = [this.lastVelocity[neighborIndex], this.lastVelocity[neighborIndex+1], this.lastVelocity[neighborIndex+2]];
                        var neighborQuaternion = [this.lastQuaternion[neighborIndex], this.lastQuaternion[neighborIndex+1], this.lastQuaternion[neighborIndex+2], this.lastQuaternion[neighborIndex+3]];
                        var neighborEuler = [this.lastRotation[neighborIndex], this.lastRotation[neighborIndex+1], this.lastRotation[neighborIndex+2]];

                        var nominalD = this._neighborOffset(j, latticePitch);
                        var actuatedD = [nominalD[0], nominalD[1], nominalD[2]];
                        var neighborAxis = Math.floor(j/2);
                        var actuation = 0;
                        if (isActuator && wiring[neighborAxis+1]>0) {
                            actuation += 0.3*this._getActuatorVoltage(wiring[neighborAxis+1]-1, time);
                        }
                        var neighborWiring = [this.wires[neighborIndex], this.wires[neighborIndex+1], this.wires[neighborIndex+2], this.wires[neighborIndex+3]];
                        if (neighborWiring[0] == -1 && neighborWiring[neighborAxis+1]>0){
                            actuation += 0.3*this._getActuatorVoltage(neighborWiring[neighborAxis+1]-1, time);
                        }
                        actuatedD[neighborAxis] *= 1+actuation;

                        var halfNominalD = [actuatedD[0]*0.5, actuatedD[1]*0.5, actuatedD[2]*0.5];
                        var rotatedHalfNomD = this._applyQuaternion(halfNominalD, quaternion);
                        var neighbRotatedHalfNomD = this._applyQuaternion(halfNominalD, neighborQuaternion);
                        var rotatedNominalD = [rotatedHalfNomD[0] + neighbRotatedHalfNomD[0], rotatedHalfNomD[1] + neighbRotatedHalfNomD[1], rotatedHalfNomD[2] + neighbRotatedHalfNomD[2]];

                        var k = this.compositeKs[neighborsIndex + j%3];
                        var d = 0.01;//this.compositeDs[neighborsIndex + j%3];

                        var D = [neighborTranslation[0]-translation[0] + nominalD[0],
                            neighborTranslation[1]-translation[1] + nominalD[1],
                            neighborTranslation[2]-translation[2] + nominalD[2]];

                        force[0] += k*(D[0] - rotatedNominalD[0]) + d*(neighborVelocity[0]-velocity[0]);
                        force[1] += k*(D[1] - rotatedNominalD[1]) + d*(neighborVelocity[1]-velocity[1]);
                        force[2] += k*(D[2] - rotatedNominalD[2]) + d*(neighborVelocity[2]-velocity[2]);

                        //non-axial rotation
                        var nonAxialRotation = this._quaternionFromUnitVectors(this._normalize3D(nominalD), this._normalize3D(D));

                        //axial rotation
                        var axis = rotatedNominalD;//neighbRotatedHalfNomD
                        var angle = this._dotVectors(neighborEuler, this._normalize3D(axis));
                        var torsion = this._quaternionFromAxisAngle(this._normalize3D(nominalD), angle);

                        var rotaionEuler = this._eulerFromQuaternion(this._multiplyQuaternions(nonAxialRotation, torsion));
                        rTotal[0] += rotaionEuler[0]*k;
                        rTotal[1] += rotaionEuler[1]*k;
                        rTotal[2] += rotaionEuler[2]*k;
                        rContrib += k;

                        //var bend = [euler[0]-neighborEuler[0], euler[1]-neighborEuler[1], euler[2]-neighborEuler[2]];
                        //var bendForce = [0,0,0];
                        //for (var l=0;l<3;l++){
                        //    if (l == neighborAxis) continue;
                        //    bendForce[this._torqueAxis(l, neighborAxis)] = bend[l]*k/1000000000;
                        //}

                        //var bendingForce = this._applyQuaternion(bendForce, quaternion);
                        //force[0] += bendingForce[0];
                        //force[1] += bendingForce[1];
                        //force[2] += bendingForce[2];
                    }

                    //simple collision detection
                    var zPosition = this.originalPosition[rgbaIndex+2]+multiplier*translation[2]-groundHeight;
                    var collisionK = 1;
                    if (zPosition<0) {
                        var normalForce = -zPosition * collisionK - collisionK / 10 * velocity[2];
                        force[2] += normalForce;
                        if (friction) {
                            var mu = 10;
                            if (velocity[0] > 0) force[0] -= mu * normalForce;
                            else if (velocity[0] < 0) force[0] += mu * normalForce;
                            if (velocity[1] > 0) force[1] -= mu * normalForce;
                            else if (velocity[1] < 0) force[1] += mu * normalForce;
                        }
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

                    if (rContrib>0) {
                        rTotal[0] /= rContrib;
                        rTotal[1] /= rContrib;
                        rTotal[2] /= rContrib;
                    }
                    this.rotation[rgbaIndex] = rTotal[0];
                    this.rotation[rgbaIndex+1] = rTotal[1];
                    this.rotation[rgbaIndex+2] = rTotal[2];
                    var nextQuaternion = this._quaternionFromEuler(rTotal);
                    this.quaternion[rgbaIndex] = nextQuaternion[0];
                    this.quaternion[rgbaIndex+1] = nextQuaternion[1];
                    this.quaternion[rgbaIndex+2] = nextQuaternion[2];
                    this.quaternion[rgbaIndex+3] = nextQuaternion[3];
                }

                if (shouldRender){
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
                        cells[index[0]][index[1]][index[2]].object3D.rotation.set(this.rotation[rgbaIndex], this.rotation[rgbaIndex+1], this.rotation[rgbaIndex+2]);
                    }
                }

                this._swapArrays("velocity", "lastVelocity");
                this._swapArrays("translation", "lastTranslation");
                this._swapArrays("quaternion", "lastQuaternion");
                this._swapArrays("rotation", "lastRotation");
            },

            _torqueAxis: function(neighbAxis, axis){
                if (0 != neighbAxis && 0 != axis) return 0;
                if (1 != neighbAxis && 1 != axis) return 1;
                return 2;
            },

            _multiplyQuaternions: function (a, b) {
                var qax = a[0], qay = a[1], qaz = a[2], qaw = a[3];
                var qbx = b[0], qby = b[1], qbz = b[2], qbw = b[3];
                return [qax * qbw + qaw * qbx + qay * qbz - qaz * qby, qay * qbw + qaw * qby + qaz * qbx - qax * qbz,
                    qaz * qbw + qaw * qbz + qax * qby - qay * qbx, qaw * qbw - qax * qbx - qay * qby - qaz * qbz];
            },

            _quaternionFromAxisAngle: function (axis, angle) {
                var halfAngle = angle / 2, s = Math.sin(halfAngle);
                return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(halfAngle)];
            },

            _eulerFromQuaternion: function(quaternion){
                return this._setFromRotationMatrix(this._makeRotationMatrixFromQuaternion(quaternion));
            },

            _quaternionFromEuler: function (euler) {

                var c1 = Math.cos(euler[0] / 2);
                var c2 = Math.cos(euler[1] / 2);
                var c3 = Math.cos(euler[2] / 2);
                var s1 = Math.sin(euler[0] / 2);
                var s2 = Math.sin(euler[1] / 2);
                var s3 = Math.sin(euler[2] / 2);

                return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3];
            },

            _clamp: function ( x, a, b ) {
                return ( x < a ) ? a : ( ( x > b ) ? b : x );
            },

            _setFromRotationMatrix: function (te) {
                // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
                var m11 = te[0], m12 = te[4], m13 = te[8];
                var m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		        var m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];
                if (Math.abs(m13) < 0.99999){
                    return [Math.atan2(-m23, m33), Math.asin(this._clamp(m13, -1, 1)), Math.atan2(-m12, m11)];
                }
                return [Math.atan2(m32, m22), Math.asin(this._clamp(m13, -1, 1)), 0];
            },

            _makeRotationMatrixFromQuaternion: function (q) {

                var te = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

                var x = q[0], y = q[1], z = q[2], w = q[3];
                var x2 = x + x, y2 = y + y, z2 = z + z;
                var xx = x * x2, xy = x * y2, xz = x * z2;
                var yy = y * y2, yz = y * z2, zz = z * z2;
                var wx = w * x2, wy = w * y2, wz = w * z2;

                te[ 0 ] = 1 - ( yy + zz );
                te[ 4 ] = xy - wz;
                te[ 8 ] = xz + wy;

                te[ 1 ] = xy + wz;
                te[ 5 ] = 1 - ( xx + zz );
                te[ 9 ] = yz - wx;

                te[ 2 ] = xz - wy;
                te[ 6 ] = yz + wx;
                te[ 10 ] = 1 - ( xx + yy );

                // last column
                te[ 3 ] = 0;
                te[ 7 ] = 0;
                te[ 11 ] = 0;

                // bottom row
                te[ 12 ] = 0;
                te[ 13 ] = 0;
                te[ 14 ] = 0;
                te[ 15 ] = 1;

                return te;
            },

            _quaternionFromUnitVectors: function (vFrom, vTo) {
                var v1 = [0,0,0];
                var r = this._dotVectors(vFrom, vTo)+1;
                if (r < 0.000001) {
                    r = 0;
                    if (Math.abs(vFrom[0]) > Math.abs(vFrom[2])) v1 = [-vFrom[1], vFrom[0], 0];
                    else v1 = [0, - vFrom[2], vFrom[1]];
                } else  v1 = this._crossVectors(vFrom, vTo);
                return this._normalize4D([v1[0], v1[1], v1[2], r]);
		    },

            _dotVectors: function(a, b){
                return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
            },

            _crossVectors: function ( a, b ) {
                var ax = a[0], ay = a[1], az = a[2];
                var bx = b[0], by = b[1], bz = b[2];
                return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
            },

            _normalize3D: function(vector){
                var length = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2]);
                return [vector[0]/length, vector[1]/length, vector[2]/length];
            },

            _normalize4D: function(vector){
                var length = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2] + vector[3]*vector[3]);
                return [vector[0]/length, vector[1]/length, vector[2]/length, vector[3]/length];
            },

            _applyQuaternion: function (vector, quaternion) {

                var x = vector[0];
                var y = vector[1];
                var z = vector[2];

                var qx = quaternion[0];
                var qy = quaternion[1];
                var qz = quaternion[2];
                var qw = quaternion[3];

                // calculate quat * vector

                var ix =  qw * x + qy * z - qz * y;
                var iy =  qw * y + qz * x - qx * z;
                var iz =  qw * z + qx * y - qy * x;
                var iw = - qx * x - qy * y - qz * z;

                // calculate result * inverse quat

                return [ix * qw + iw * - qx + iy * - qz - iz * - qy,
                    iy * qw + iw * - qy + iz * - qx - ix * - qz,
                    iz * qw + iw * - qz + ix * - qy - iy * - qx];
            },

            _neighborSign: function(index){
                if (index%2 == 0) return -1;
                return 1;
            },

            _neighborOffset: function(index, latticePitch){
                var offset = [0,0,0];
                var neighborAxis = Math.floor(index/2);
                offset[neighborAxis] = this._neighborSign(index)*latticePitch[neighborAxis];
                return offset;
            },

            _getActuatorVoltage: function(wireIndex, time){
                wireIndex *= 4;
                var wireMeta = [this.wiresMeta[wireIndex], this.wiresMeta[wireIndex+1], this.wiresMeta[wireIndex+2], this.wiresMeta[wireIndex+3]];
                var type = wireMeta[0];
                if (type == -1) {
                    //no signal connected
                    return 0;
                }
                var frequency = wireMeta[1];
                var period = 1/frequency;
                var phase = wireMeta[2];
                var currentPhase = ((time + phase*period)%period)/period;
                if (type == 0){
                    return 0.5*Math.sin(2*Math.PI*currentPhase);
                }
                if (type == 1){
                    var pwm = wireMeta[3];
                    if (currentPhase < pwm) return 0.5;
                    return -0.5;
                }
                if (type == 2){
                    if (wireMeta[3]>0) return 0.5-currentPhase;
                    return currentPhase-0.5;
                }
                if (type == 3){
                    if (currentPhase < 0.5) return currentPhase*2-0.5;
                    return 0.5-(currentPhase-0.5)*2;
                }
                return 0;
            },

            _swapArrays: function(array1Name, array2Name){
                var temp = this[array1Name];
                this[array1Name] = this[array2Name];
                this[array2Name] = temp;
            },

            reset: function(){
                if (!this.textureSize) return;//no cells
                var textureSize = this.textureSize[0]*this.textureSize[1];

                var self = this;
                this._loopCells(lattice.getCells(), function(cell){
                    var index = cell.getAbsoluteIndex().sub(lattice.get("cellsMin"));
                    var rgbaIndex = 4*self.cellsIndexMapping[index.x][index.y][index.z];
                    var position = [self.originalPosition[rgbaIndex], self.originalPosition[rgbaIndex+1], self.originalPosition[rgbaIndex+2]];
                    cell.object3D.position.set(position[0], position[1], position[2]);
                    cell.object3D.rotation.set(0, 0, 0);
                });

                this.lastTranslation = new Float32Array(textureSize*4);
                this.translation = new Float32Array(textureSize*4);
                this.lastVelocity = new Float32Array(textureSize*4);
                this.velocity = new Float32Array(textureSize*4);
                this.lastQuaternion = new Float32Array(textureSize*4);
                this.quaternion = new Float32Array(textureSize*4);
                for (var i=0;i<textureSize;i++){
                    this.lastQuaternion[4*i+3] = 1;//w = 1
                    this.quaternion[4*i+3] = 1;
                }

            }

        });


        return new EMSimLattice();


    });