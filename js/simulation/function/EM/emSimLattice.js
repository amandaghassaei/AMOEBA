/**
 * Created by ghassaei on 2/27/16.
 */


define(['underscore', 'backbone', 'threeModel', 'lattice', 'plist', 'emWire', 'GPUMath', "text!simulation/shaders/vertexShader.js",
    "text!simulation/function/EM/shaders/accelerationCalcShader.js", "text!simulation/shaders/packToBytesShader.js", "text!simulation/function/EM/shaders/positionCalcShader.js",
    "text!simulation/function/EM/shaders/angVelocityCalcShader.js", "text!simulation/function/EM/shaders/quaternionCalcShader.js",
    "text!simulation/function/EM/shaders/velocityCalcShader.js", 'emSimCell'],
    function(_, Backbone, three, lattice, plist, EMWire, gpuMath, vertexShader, accelerationCalcShader, packToBytesShader,
             positionCalcShader, angVelocityCalcShader, quaternionCalcShader, velocityCalcShader) {

        var EMSimLattice = Backbone.Model.extend({

            defaults: {
                wires: {},
                signals: [],
                signalsData: [],//from load file
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
                    require(["modalView"], function(ModalView){
                        new ModalView({small: true, title:"", text:"No cells in assembly.<br/>Please go back to 'Design' tab and add cells."});
                    });
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
                this.originalQuaternion = new Float32Array(textureSize*4);
                this.translation = new Float32Array(textureSize*4);
                this.lastTranslation = new Float32Array(textureSize*4);
                this.lastLastTranslation = new Float32Array(textureSize*4);
                this.velocity = new Float32Array(textureSize*4);
                this.lastVelocity = new Float32Array(textureSize*4);
                this.acceleration = new Float32Array(textureSize*4);

                this.quaternion = new Float32Array(textureSize*4);
                this.lastQuaternion = new Float32Array(textureSize*4);
                this.angVelocity = new Float32Array(textureSize*4);
                this.lastAngVelocity = new Float32Array(textureSize*4);

                this.cellsArrayMapping = new Int16Array(textureSize*4);//holds lattice index of cell (for rendering from texture)

                this.mass = new Float32Array(textureSize*4);//first element is mass, second element in fixed, third element is moment of inertia

                this.neighborsXMapping = new Float32Array(textureSize*8);//-1 equals no neighb
                this.neighborsYMapping = new Float32Array(textureSize*8);//would have done int16, but no int types have > 8 bits
                this.compositeKs = new Float32Array(textureSize*8*6);
                this.compositeDs = new Float32Array(textureSize*8*6);

                //todo int array
                this.wires = new Float32Array(textureSize*4);//also stores actuator mask as -1
                var wires = this.get("wires");
                this.resetWiresMetaTexture(wires);

                this.cellsIndexMapping = this._initEmptyArray(cells);//3d array holds rgba index of cell (for use within this class)
                var cellsMin = lattice.get("cellsMin");

                var index = 0;
                var self = this;
                for (var i=0;i<textureSize;i++){
                    this.mass[4*i+1] = -1;//indicates no cell is present
                }
                this._loopCells(cells, function(cell, x, y, z){

                    var rgbaIndex = 4*index;

                    var position = cell.getPosition();
                    self.originalPosition[rgbaIndex] = position.x;
                    self.originalPosition[rgbaIndex+1] = position.y;
                    self.originalPosition[rgbaIndex+2] = position.z;

                    var quaternion = cell.getOrientation();
                    self.originalQuaternion[rgbaIndex] = quaternion.x;
                    self.originalQuaternion[rgbaIndex+1] = quaternion.y;
                    self.originalQuaternion[rgbaIndex+2] = quaternion.z;
                    self.originalQuaternion[rgbaIndex+3] = quaternion.w;

                    self.cellsArrayMapping[rgbaIndex] = x;
                    self.cellsArrayMapping[rgbaIndex+1] = y;
                    self.cellsArrayMapping[rgbaIndex+2] = z;

                    self.mass[rgbaIndex] = self._calcCellMass(cell);
                    self.mass[rgbaIndex+1] = 0;//indicated a cell is present
                    var latticePitch = lattice.getPitch();
                    self.mass[rgbaIndex+2] = 1/6*self.mass[rgbaIndex]*latticePitch.x*latticePitch.x;//moment of inertia for a cube

                    self.cellsIndexMapping[x][y][z] = index;

                    self.lastQuaternion[rgbaIndex+3] = 1;//quat = (0,0,0,1)
                    self.quaternion[rgbaIndex+3] = 1;

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

                        var compositeIndex = index*8;//[x0, x1, x2, ---][x3,x4, x5, ---]
                        if (neighborIndex > 2) compositeIndex += 4;

                        if (!neighbor) {
                            self.neighborsXMapping[compositeIndex + neighborIndex%3] = -1;
                            self.neighborsYMapping[compositeIndex + neighborIndex%3] = -1;
                            return;
                        }

                        var neighborIndex3D = neighbor.getIndex().sub(cellsMin);
                        var neighborMappingIndex1D = self.cellsIndexMapping[neighborIndex3D.x][neighborIndex3D.y][neighborIndex3D.z];
                        self.neighborsXMapping[compositeIndex + neighborIndex%3] = neighborMappingIndex1D%textureDim;
                        self.neighborsYMapping[compositeIndex + neighborIndex%3] = parseInt(neighborMappingIndex1D/textureDim);


                        //[l, s, s, ---][t, b, b, ---]
                        var neighborAxis = Math.floor(neighborIndex / 2);
                        var neighborAxisName = self._getAxisName(neighborAxis);
                        _.each(["x", "y", "z"], function(axis, axisIndex){
                            if (axisIndex == neighborAxis) {//longitudal
                                var cellK = self._getCellK(cell, "longitudal");
                                var neighborK = self._getCellK(neighbor, "longitudal");
                                var compositeK = self._calcCompositeParam(cellK[self._getRotatedAxis(axis, cell)], neighborK[self._getRotatedAxis(axis, neighbor)]);
                                self.compositeKs[index*8*6 + neighborIndex*8 + axisIndex] = compositeK;
                                self.compositeDs[index*8*6 + neighborIndex*8 + axisIndex] = compositeK/1000;//this is arbitrary for now
                            } else {//shear
                                var cellK = self._getCellK(cell, "shear");
                                var neighborK = self._getCellK(neighbor, "shear");
                                var compositeK = self._calcCompositeParam(cellK[self._getRotatedAxis(neighborAxisName, cell)+self._getRotatedAxis(axis, cell)],
                                neighborK[self._getRotatedAxis(neighborAxisName, neighbor)+self._getRotatedAxis(axis, neighbor)]);
                                self.compositeKs[index*8*6 + neighborIndex*8 + axisIndex] = compositeK;
                                self.compositeDs[index*8*6 + neighborIndex*8 + axisIndex] = compositeK/1000;//this is arbitrary for now
                            }
                        });
                        _.each(["x", "y", "z"], function(axis, axisIndex){
                            if (axisIndex == neighborAxis) {//torsion
                                var cellK = self._getCellK(cell, "torsion");
                                var neighborK = self._getCellK(neighbor, "torsion");
                                var compositeK = self._calcCompositeParam(cellK[self._getRotatedAxis(axis, cell)], neighborK[self._getRotatedAxis(axis, neighbor)]);
                                self.compositeKs[index*8*6 + neighborIndex*8 + 4 + axisIndex] = compositeK;
                                self.compositeDs[index*8*6 + neighborIndex*8 + 4 + axisIndex] = compositeK/1000;//this is arbitrary for now
                            } else {//bending
                                var cellK = self._getCellK(cell, "bending");
                                var neighborK = self._getCellK(neighbor, "bending");
                                var compositeK = self._calcCompositeParam(cellK[self._getRotatedAxis(axis, cell)], neighborK[self._getRotatedAxis(axis, neighbor)]);
                                self.compositeKs[index*8*6 + neighborIndex*8 + 4 + axisIndex] = compositeK;
                                self.compositeDs[index*8*6 + neighborIndex*8 + 4 + axisIndex] = compositeK/1000;//this is arbitrary for now
                            }
                        });
                    });

                    if (cell.isAcutator()){

                        var wireIndices = [];
                        var wireKeys = _.keys(self.get("wires"));
                        _.each(neighbors, function (neighbor) {
                            if (neighbor && neighbor.isConductive()) {
                                if (cell.isConnectedTo(neighbor)){
                                    wireIndices.push(wireKeys.indexOf("" + neighbor.getWireGroup()));
                                }
                            }
                        });

                        if (wireIndices.length == 2){

                            //actuator type - 0 indicates nothing, -1=longitudal, -2=bending, -3=torsional, 4, 5=shear
                            if (cell.getMaterialID() == "actuatorLinear1DOF") self.wires[rgbaIndex] = -1;
                            else if (cell.getMaterialID() == "actuatorBending1DOF") self.wires[rgbaIndex] = -2;
                            else if (cell.getMaterialID() == "actuatorTorsion1DOF") self.wires[rgbaIndex] = -3;
                            else if (cell.getMaterialID() == "actuatorShear") self.wires[rgbaIndex] = -4;
                            else if (cell.getMaterialID() == "actuatorShear") self.wires[rgbaIndex] = -5;//todo fix this

                            //use remaining three spots to indicate axial direction and wire group num
                            self.wires[rgbaIndex+1] = wireIndices[0];
                            self.wires[rgbaIndex+2] = wireIndices[1];
                            var axis = cell.getMaterial().properties.conductiveAxes[0];
                            var vector = new THREE.Vector3(axis.x, axis.y, axis.z);
                            vector.applyQuaternion(cell.getOrientation());
                            var axisNum = 0;
                            if (Math.abs(vector.x) > 0.9) axisNum = 0;
                            else if (Math.abs(vector.y) > 0.9) axisNum = 1;
                            else if (Math.abs(vector.z) > 0.9) axisNum = 2;
                            else console.warn("bad actuator axis");
                            self.wires[rgbaIndex+3] = axisNum;
                            actuators.push({cell: cell, valid: true, wireIndices: wireIndices});
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
                        this.mass[rgbaIndex+1] = 1;
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

            _getRotatedAxis: function(_axis, _cell){
                var vector = new THREE.Vector3();
                vector[_axis] = 1;
                vector.applyQuaternion(_cell.getOrientation().inverse());
                if (Math.abs(vector.x)>0.9) return "x";
                if (Math.abs(vector.y)>0.9) return "y";
                if (Math.abs(vector.z)>0.9) return "z";
                console.warn("bad rotation for cell given " + _axis);
                return "x";
            },

            _getAxisName: function(index){
                var axes = ["x", "y", "z"];
                return axes[index];
            },

            _setupGPU: function(textureDim){
                gpuMath.reset();

                var latticePitch = lattice.getPitch();

                gpuMath.initTextureFromData("u_translation", textureDim, textureDim, "FLOAT", this.translation);
                gpuMath.initFrameBufferForTexture("u_translation");
                gpuMath.initTextureFromData("u_lastTranslation", textureDim, textureDim, "FLOAT", this.lastTranslation);
                gpuMath.initFrameBufferForTexture("u_lastTranslation");
                gpuMath.initTextureFromData("u_lastLastTranslation", textureDim, textureDim, "FLOAT", this.lastLastTranslation);
                gpuMath.initFrameBufferForTexture("u_lastLastTranslation");
                gpuMath.initTextureFromData("u_velocity", textureDim, textureDim, "FLOAT", this.velocity);
                gpuMath.initFrameBufferForTexture("u_velocity");
                gpuMath.initTextureFromData("u_lastVelocity", textureDim, textureDim, "FLOAT", this.lastVelocity);
                gpuMath.initFrameBufferForTexture("u_lastVelocity");
                gpuMath.initTextureFromData("u_acceleration", textureDim, textureDim, "FLOAT", this.acceleration);
                gpuMath.initFrameBufferForTexture("u_acceleration");
                gpuMath.initTextureFromData("u_quaternion", textureDim, textureDim, "FLOAT", this.quaternion);
                gpuMath.initFrameBufferForTexture("u_quaternion");
                gpuMath.initTextureFromData("u_lastQuaternion", textureDim, textureDim, "FLOAT", this.lastQuaternion);
                gpuMath.initFrameBufferForTexture("u_lastQuaternion");
                gpuMath.initTextureFromData("u_angVelocity", textureDim, textureDim, "FLOAT", this.angVelocity);
                gpuMath.initFrameBufferForTexture("u_angVelocity");
                gpuMath.initTextureFromData("u_lastAngVelocity", textureDim, textureDim, "FLOAT", this.lastAngVelocity);
                gpuMath.initFrameBufferForTexture("u_lastAngVelocity");

                gpuMath.initTextureFromData("u_mass", textureDim, textureDim, "FLOAT", this.mass);
                gpuMath.initTextureFromData("u_neighborsXMapping", textureDim*2, textureDim, "FLOAT", this.neighborsXMapping);
                gpuMath.initTextureFromData("u_neighborsYMapping", textureDim*2, textureDim, "FLOAT", this.neighborsYMapping);
                gpuMath.initTextureFromData("u_compositeKs", textureDim*2*6, textureDim, "FLOAT", this.compositeKs);
                gpuMath.initTextureFromData("u_compositeDs", textureDim*2*6, textureDim, "FLOAT", this.compositeDs);
                gpuMath.initTextureFromData("u_originalPosition", textureDim, textureDim, "FLOAT", this.originalPosition);
                gpuMath.initTextureFromData("u_wires", textureDim, textureDim, "FLOAT", this.wires);//todo byte
                gpuMath.initTextureFromData("u_wiresMeta", 1, this.wiresMeta.length/4, "FLOAT", this.wiresMeta);


                //programs
                gpuMath.createProgram("angVelocityCalc", vertexShader, angVelocityCalcShader);
                gpuMath.setUniformForProgram("angVelocityCalc", "u_lastAngVelocity", 0, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_lastVelocity", 1, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_lastTranslation", 2, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_mass", 3, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_neighborsXMapping", 4, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_neighborsYMapping", 5, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_compositeKs", 6, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_compositeDs", 7, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_lastQuaternion", 8, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_wires", 9, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_wiresMeta", 10, "1i");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_textureDim", [textureDim, textureDim], "2f");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_multiplier", 1/(plist.allUnitTypes[lattice.getUnits()].multiplier), "1f");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_latticePitch", [latticePitch.x, latticePitch.y, latticePitch.z], "3f");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_wiresMetaLength", this.wiresMeta.length/4, "1f");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_time", 0, "1f");

                gpuMath.createProgram("quaternionCalc", vertexShader, quaternionCalcShader);
                gpuMath.setUniformForProgram("quaternionCalc", "u_lastAngVelocity", 0, "1i");
                gpuMath.setUniformForProgram("quaternionCalc", "u_lastQuaternion", 1, "1i");
                gpuMath.setUniformForProgram("quaternionCalc", "u_mass", 2, "1i");
                gpuMath.setUniformForProgram("quaternionCalc", "u_textureDim", [textureDim, textureDim], "2f");

                gpuMath.createProgram("accelerationCalc", vertexShader, accelerationCalcShader);
                gpuMath.setUniformForProgram("accelerationCalc", "u_lastVelocity", 0, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_lastTranslation", 1, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_mass", 2, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_neighborsXMapping", 3, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_neighborsYMapping", 4, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_compositeKs", 5, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_compositeDs", 6, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_originalPosition", 7, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_lastQuaternion", 8, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_wires", 9, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_wiresMeta", 10, "1i");
                gpuMath.setUniformForProgram("accelerationCalc", "u_textureDim", [textureDim, textureDim], "2f");
                gpuMath.setUniformForProgram("accelerationCalc", "u_multiplier", 1/(plist.allUnitTypes[lattice.getUnits()].multiplier), "1f");
                gpuMath.setUniformForProgram("accelerationCalc", "u_latticePitch", [latticePitch.x, latticePitch.y, latticePitch.z], "3f");
                gpuMath.setUniformForProgram("accelerationCalc", "u_wiresMetaLength", this.wiresMeta.length/4, "1f");
                gpuMath.setUniformForProgram("accelerationCalc", "u_time", 0, "1f");

                gpuMath.createProgram("positionCalc", vertexShader, positionCalcShader);
                gpuMath.setUniformForProgram("positionCalc", "u_acceleration", 0, "1i");
                gpuMath.setUniformForProgram("positionCalc", "u_lastTranslation", 1, "1i");
                gpuMath.setUniformForProgram("positionCalc", "u_lastLastTranslation", 2, "1i");
                gpuMath.setUniformForProgram("positionCalc", "u_mass", 3, "1i");
                gpuMath.setUniformForProgram("positionCalc", "u_textureDim", [textureDim, textureDim], "2f");

                gpuMath.createProgram("velocityCalc", vertexShader, velocityCalcShader);
                gpuMath.setUniformForProgram("velocityCalc", "u_translation", 0, "1i");
                gpuMath.setUniformForProgram("velocityCalc", "u_lastTranslation", 1, "1i");
                gpuMath.setUniformForProgram("velocityCalc", "u_mass", 2, "1i");
                gpuMath.setUniformForProgram("velocityCalc", "u_textureDim", [textureDim, textureDim], "2f");

                gpuMath.createProgram("packToBytes", vertexShader, packToBytesShader);
                gpuMath.initTextureFromData("outputPositionBytes", textureDim*3, textureDim, "UNSIGNED_BYTE", null);
                gpuMath.initFrameBufferForTexture("outputPositionBytes");
                gpuMath.initTextureFromData("outputQuaternionBytes", textureDim*4, textureDim, "UNSIGNED_BYTE", null);
                gpuMath.initFrameBufferForTexture("outputQuaternionBytes");
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

            _getCellK: function(cell, dof){
                if (dof == "longitudal") return cell.getMaterial().getLongitudalK();
                else if (dof == "shear") return cell.getMaterial().getShearK();
                else if (dof == "bending") return cell.getMaterial().getBendingK();
                else if (dof == "torsion") return cell.getMaterial().getTorsionK();
                console.warn("unknown dof type " + dof);
                return null;
            },

            _calcCompositeParam: function(param1, param2){
                if (param1 == param2) return param1;
                return 2*param1*param2/(param1+param2);
            },

            isFixedAtIndex: function(index){
                var rgbaIndex = 4*(this.cellsIndexMapping[index.x][index.y][index.z]);
                return this.mass[rgbaIndex+1] == 1;
            },

            _precomputeSignals: function(cells){
                var signals = [];
                this._loopCells(cells, function(cell){
                    if (cell.isSignalGenerator()) {
                        cell.setAsSignalGenerator();
                        signals.push(cell);
                    }
                });

                var cellsMin = lattice.get("cellsMin");
                _.each(this.get("signalsData"), function(data){
                    var index = data.index.sub(cellsMin);
                    if (cells && cells[index.x] && cells[index.x][index.y] && cells[index.x][index.y][index.z]){
                        cells[index.x][index.y][index.z].setAsSignalGenerator(data.json);
                    }
                });
                this.set("signalsData", []);
                this.set("signals", signals);
            },

            _assignSignalsToWires: function(){
                var wires = this.get("wires");
                var signalConflict = false;
                _.each(this.get("signals"), function(signal){
                    _.each(signal.terminals, function(wireNum, index){
                        if (wireNum < 0 ) return;
                        signalConflict |= wires[wireNum].addSignal(signal);
                        wires[wireNum].setPolarity(index);
                    });
                });
                _.each(this.get("signals"), function(signal){
                    _.each(signal.calcNeighbors(signal.getIndex()), function(neighbor){
                        if (neighbor && neighbor.isSignalGenerator()){
                            if (signal.isConnectedTo(neighbor)) signalConflict = true;
                        }
                    })
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

                    var polarity = wire.getPolarity();
                    var waveformType = signal.waveformType;
                    if (waveformType == "sine"){
                        wiresMeta[i] = 0+polarity*4;
                    } else if (waveformType == "square"){
                        wiresMeta[i] = 1+polarity*4;
                        wiresMeta[i+3] = signal.pwm
                    } else if (waveformType == "saw"){
                        wiresMeta[i] = 2+polarity*4;
                        if (signal.invertSignal) wiresMeta[i+3] = signal.invertSignal;
                    } else if (waveformType == "triangle"){
                        wiresMeta[i] = 3+polarity*4;
                    }
                    wiresMeta[i+1] = signal.frequency;
                    wiresMeta[i+2] = signal.phase;

                    index++;
                });
                this.wiresMeta = wiresMeta;
                if (this.wiresMeta.length == 0) this.wiresMeta = new Float32Array(4);//don't send in empty array as texture
                gpuMath.initTextureFromData("u_wiresMeta", 1, this.wiresMeta.length/4, "FLOAT", this.wiresMeta, true);
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
                var state = this.mass[rgbaIndex+1];
                if (state == -1){
                    console.warn("no cell at index " + index.x + ", " + index.y + ", " + index.z);
                }
                this.mass[rgbaIndex+1] = !state;
                gpuMath.initTextureFromData("u_mass", this.textureSize[0], this.textureSize[1], "FLOAT", this.mass, true);
                return !state;
            },

            setConstants: function(dt, gravity, groundHeight, friction){
                gpuMath.setProgram("accelerationCalc");
                gpuMath.setUniformForProgram("accelerationCalc", "u_gravity", [gravity.x, gravity.y, gravity.z], "3f");
                gpuMath.setUniformForProgram("accelerationCalc", "u_groundHeight", groundHeight, "1f");
                gpuMath.setUniformForProgram("accelerationCalc", "u_friction", friction, "1f");
                gpuMath.setProgram("velocityCalc");
                gpuMath.setUniformForProgram("velocityCalc", "u_dt", dt, "1f");
                gpuMath.setProgram("positionCalc");
                gpuMath.setUniformForProgram("positionCalc", "u_dt", dt, "1f");
                gpuMath.setProgram("angVelocityCalc");
                gpuMath.setUniformForProgram("angVelocityCalc", "u_dt", dt, "1f");
                gpuMath.setProgram("quaternionCalc");
                gpuMath.setUniformForProgram("quaternionCalc", "u_dt", dt, "1f");
            },

            iter: function(time, runConstants, shouldRender){

                //gpuMath.step("accelerationCalc", ["u_lastVelocity", "u_lastTranslation", "u_mass", "u_neighborsXMapping",
                //    "u_neighborsYMapping", "u_compositeKs", "u_compositeDs", "u_originalPosition", "u_lastQuaternion", "u_wires",
                //    "u_wiresMeta"], "u_acceleration", time);
                //gpuMath.step("positionCalc", ["u_acceleration", "u_lastTranslation", "u_lastLastTranslation", "u_mass"],
                //    "u_translation");
                //gpuMath.step("velocityCalc", ["u_translation", "u_lastTranslation"], "u_velocity");
                //
                //gpuMath.step("angVelocityCalc", ["u_lastAngVelocity", "u_lastVelocity", "u_lastTranslation", "u_mass", "u_neighborsXMapping",
                //    "u_neighborsYMapping", "u_compositeKs", "u_compositeDs", "u_lastQuaternion", "u_wires",
                //    "u_wiresMeta"], "u_angVelocity", time);
                //gpuMath.step("quaternionCalc", ["u_angVelocity", "u_lastQuaternion", "u_mass"], "u_quaternion");
                //
                //if (shouldRender) {
                //    var textureSize = this.textureSize[0]*this.textureSize[1];
                //
                //    //get position
                //    var vectorLength = 3;
                //    gpuMath.setProgram("packToBytes");
                //    gpuMath.setUniformForProgram("packToBytes", "u_vectorLength", vectorLength, "1f");
                //    gpuMath.setSize(this.textureSize[0]*vectorLength, this.textureSize[1]);
                //    gpuMath.step("packToBytes", ["u_translation"], "outputPositionBytes");
                //    var pixels = new Uint8Array(textureSize * 4*vectorLength);
                //    if (gpuMath.readyToRead()) {
                //        gpuMath.readPixels(0, 0, this.textureSize[0] * vectorLength, this.textureSize[1], pixels);
                //        var parsedPixels = new Float32Array(pixels.buffer);
                //        var cells = lattice.getCells();
                //        var multiplier = 1 / (plist.allUnitTypes[lattice.getUnits()].multiplier);
                //        for (var i = 0; i < textureSize; i++) {
                //            var rgbaIndex = 4 * i;
                //            if (this.mass[rgbaIndex+1] < 0) continue;//no more cells
                //            var index = [this.cellsArrayMapping[rgbaIndex], this.cellsArrayMapping[rgbaIndex + 1], this.cellsArrayMapping[rgbaIndex + 2]];
                //            var parsePixelsIndex = vectorLength * i;
                //            var translation = [parsedPixels[parsePixelsIndex], parsedPixels[parsePixelsIndex + 1], parsedPixels[parsePixelsIndex + 2]];
                //            var position = [this.originalPosition[rgbaIndex], this.originalPosition[rgbaIndex + 1], this.originalPosition[rgbaIndex + 2]];
                //            position[0] += multiplier * translation[0];
                //            position[1] += multiplier * translation[1];
                //            position[2] += multiplier * translation[2];
                //            cells[index[0]][index[1]][index[2]].object3D.position.set(position[0], position[1], position[2]);
                //        }
                //    }
                //
                //    vectorLength = 4;
                //    gpuMath.setUniformForProgram("packToBytes", "u_vectorLength", vectorLength, "1f");
                //    gpuMath.setSize(this.textureSize[0]*vectorLength, this.textureSize[1]);
                //    gpuMath.step("packToBytes", ["u_quaternion"], "outputQuaternionBytes");
                //    pixels = new Uint8Array(textureSize * 4*vectorLength);
                //    if (gpuMath.readyToRead()) {
                //        gpuMath.readPixels(0, 0, this.textureSize[0] * vectorLength, this.textureSize[1], pixels);
                //        parsedPixels = new Float32Array(pixels.buffer);
                //        for (var i = 0; i < textureSize; i++) {
                //            var rgbaIndex = 4 * i;
                //            if (this.mass[rgbaIndex+1] < 0) break;//no more cells
                //            var index = [this.cellsArrayMapping[rgbaIndex], this.cellsArrayMapping[rgbaIndex + 1], this.cellsArrayMapping[rgbaIndex + 2]];
                //            var parsePixelsIndex = vectorLength * i;
                //
                //            var quaternion = this._multiplyQuaternions([parsedPixels[parsePixelsIndex], parsedPixels[parsePixelsIndex + 1], parsedPixels[parsePixelsIndex + 2], parsedPixels[parsePixelsIndex + 3]],
                //                [this.originalQuaternion[rgbaIndex], this.originalQuaternion[rgbaIndex+1], this.originalQuaternion[rgbaIndex+2], this.originalQuaternion[rgbaIndex+3]]);
                //            var rotation = this._eulerFromQuaternion(quaternion);
                //
                //            cells[index[0]][index[1]][index[2]].object3D.rotation.set(rotation[0], rotation[1], rotation[2]);
                //        }
                //    }
                //
                //    gpuMath.setSize(this.textureSize[0], this.textureSize[1]);
                //}
                //
                //gpuMath.swapTextures("u_velocity", "u_lastVelocity");
                //gpuMath.swap3Textures("u_translation", "u_lastTranslation", "u_lastLastTranslation");
                //gpuMath.swapTextures("u_angVelocity", "u_lastAngVelocity");
                //gpuMath.swapTextures("u_quaternion", "u_lastQuaternion");
                //return;

                var gravity = runConstants.gravity;
                var groundHeight = runConstants.groundHeight;
                var friction = runConstants.friction;
                var dt = runConstants.dt;

                var latticePitch = lattice.getPitch();
                latticePitch = [latticePitch.x, latticePitch.y, latticePitch.z];
                var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);

                var textureSize = this.textureSize[0]*this.textureSize[1];

                for (var i=0;i<textureSize;i++){

                    var rgbaIndex = i*4;
                    if (this.mass[rgbaIndex+1] == 1) continue;//fixed
                    var mass = this.mass[rgbaIndex];
                    if (mass == 0) continue;
                    var force = [mass*gravity.x, mass*gravity.y, mass*gravity.z];//translational force
                    var I = this.mass[rgbaIndex+2];//moment of inerita
                    var rForce = [0,0,0];//rotational force


                    var translation = [this.lastTranslation[rgbaIndex], this.lastTranslation[rgbaIndex+1], this.lastTranslation[rgbaIndex+2]];
                    var velocity = [this.lastVelocity[rgbaIndex], this.lastVelocity[rgbaIndex+1], this.lastVelocity[rgbaIndex+2]];
                    var quaternion = [this.lastQuaternion[rgbaIndex], this.lastQuaternion[rgbaIndex+1], this.lastQuaternion[rgbaIndex+2], this.lastQuaternion[rgbaIndex+3]];
                    var angVelocity = [this.lastAngVelocity[rgbaIndex], this.lastAngVelocity[rgbaIndex+1], this.lastAngVelocity[rgbaIndex+2]];

                    var wiring = [this.wires[rgbaIndex], this.wires[rgbaIndex+1], this.wires[rgbaIndex+2], this.wires[rgbaIndex+3]];
                    var actuatorType = wiring[0];//properly wired actuator has type < 0

                    for (var j=0;j<6;j++) {

                        var _force = [0, 0, 0];

                        var neighborsIndex = i * 8;
                        if (j > 2) neighborsIndex += 4;
                        if (this.neighborsXMapping[neighborsIndex + j % 3] < 0) continue;

                        var neighborIndex = 4 * (this.neighborsXMapping[neighborsIndex + j % 3] + this.textureSize[0] * this.neighborsYMapping[neighborsIndex + j % 3]);
                        var neighborTranslation = [this.lastTranslation[neighborIndex], this.lastTranslation[neighborIndex + 1], this.lastTranslation[neighborIndex + 2]];
                        var neighborVelocity = [this.lastVelocity[neighborIndex], this.lastVelocity[neighborIndex + 1], this.lastVelocity[neighborIndex + 2]];
                        var neighborQuaternion = [this.lastQuaternion[neighborIndex], this.lastQuaternion[neighborIndex + 1], this.lastQuaternion[neighborIndex + 2], this.lastQuaternion[neighborIndex + 3]];
                        //var neighborRotation = [this.lastTranslation[neighborIndex + 4 * textureSize], this.lastTranslation[neighborIndex + 1 + 4 * textureSize], this.lastTranslation[neighborIndex + 2 + 4 * textureSize]];
                        //var neighborAngVelocity = [this.lastVelocity[neighborIndex + 4 * textureSize], this.lastVelocity[neighborIndex + 1 + 4 * textureSize], this.lastVelocity[neighborIndex + 2 + 4 * textureSize]];

                        var translationalK = [this.compositeKs[i*8*6 + j*8], this.compositeKs[i*8*6 + j*8 + 1], this.compositeKs[i*8*6 + j*8 + 2]];
                        var translationalD = [this.compositeDs[i*8*6 + j*8], this.compositeDs[i*8*6 + j*8 + 1], this.compositeDs[i*8*6 + j*8 + 2]];
                        var rotationalK = [this.compositeKs[i*8*6 + j*8 + 4], this.compositeKs[i*8*6 + j*8 + 5], this.compositeKs[i*8*6 + j*8 + 6]];
                        var rotationalD = [this.compositeDs[i*8*6 + j*8 + 4], this.compositeDs[i*8*6 + j*8 + 5], this.compositeDs[i*8*6 + j*8 + 6]];

                        var nominalD = this._neighborOffset(j, latticePitch);

                        var neighborAxis = Math.floor(j / 2);
                        var neighborSign = Math.floor(j%3);

                        var actuation = 0;
                        var _actuatorType = -1;
                        if (actuatorType<0 && wiring[3] == neighborAxis) {
                            _actuatorType = actuatorType;
                            actuation += 0.3*(this._getActuatorVoltage(wiring[1], time) - this._getActuatorVoltage(wiring[2], time));
                        } else {
                            var neighborWiring = [this.wires[neighborIndex], this.wires[neighborIndex+1], this.wires[neighborIndex+2], this.wires[neighborIndex+3]];
                            var neighborActuatorType = neighborWiring[0];//properly wired actuator has type < 0
                            _actuatorType = neighborActuatorType;
                            if (neighborActuatorType<0 && neighborWiring[3] == neighborAxis){
                                actuation += 0.3*(this._getActuatorVoltage(neighborWiring[1], time) - this._getActuatorVoltage(neighborWiring[2], time));
                            }
                        }
                        var actuatedD = [nominalD[0], nominalD[1], nominalD[2]];
                        if (_actuatorType == -1) actuatedD[neighborAxis] *= 1+actuation;//linear actuator
                        else if (_actuatorType == -4) { actuatedD[1] += actuatedD[neighborAxis]*actuation;//shear

                        //convert translational offsets to correct reference frame
                        var halfNominalD = this._multiplyVectorScalar(actuatedD, 0.5);
                        var cellHalfNominalD = this._applyQuaternion(halfNominalD, quaternion);//halfNominalD in cell's reference frame
                        var neighborHalfNominalD = this._applyQuaternion(halfNominalD, neighborQuaternion);//halfNominalD in neighbor's reference frame

                        var averageQuaternion = this._averageQuaternions(quaternion, neighborQuaternion);
                        var averageQuaternionInverse = this._invertQuaternion(averageQuaternion);
                        var translationalDelta = [
                            neighborTranslation[0] - translation[0] + nominalD[0] - cellHalfNominalD[0] - neighborHalfNominalD[0],
                            neighborTranslation[1] - translation[1] + nominalD[1] - cellHalfNominalD[1] - neighborHalfNominalD[1],
                            neighborTranslation[2] - translation[2] + nominalD[2] - cellHalfNominalD[2] - neighborHalfNominalD[2]
                        ];
                        var translationalDeltaXYZ = this._applyQuaternion(translationalDelta, averageQuaternionInverse);
                        var velocityDelta = [neighborVelocity[0] - velocity[0], neighborVelocity[1] - velocity[1], neighborVelocity[2] - velocity[2]];
                        var velocityDeltaXYZ = this._applyQuaternion(velocityDelta, averageQuaternionInverse);

                        //longitudal and shear
                        for (var _axis = 0; _axis < 3; _axis++) {
                            _force[_axis] += translationalK[_axis]*translationalDeltaXYZ[_axis] + translationalD[_axis]*velocityDeltaXYZ[_axis];
                        }
                        //convert _force vector back into world reference frame
                        _force = this._applyQuaternion(_force, averageQuaternion);
                        force = this._addVectors(force, _force);

                        //translational forces cause rotation in cell - convert to cell reference frame
                        var torque = this._crossVectors(halfNominalD, this._applyQuaternion(_force, this._invertQuaternion(quaternion)));//cellHalfNominalD = lever arm
                        rForce[0] += torque[0];
                        rForce[1] += torque[1];
                        rForce[2] += torque[2];

                        //todo this is causing instability
                        //bending and torsion
                        var quaternionDiff = this._multiplyQuaternions(this._invertQuaternion(quaternion), neighborQuaternion);
                        var diffEuler = this._eulerFromQuaternion(quaternionDiff);
                        //if (_actuatorType == -3) {//torsional actuator
                        //    if (neighborSign) actuation *= -1;
                        //    diffEuler[neighborAxis] += 0.5*actuation;
                        //} else if (_actuatorType == -2){
                        //    diffEuler[wiring[3]] += actuation;
                        //}
                        for (var _axis = 0; _axis < 3; _axis++) {
                            rForce[_axis] += 0.00001 * rotationalK[_axis] * (diffEuler[_axis]);// + rotationalD[_axis]*(neighborAngVelocity[_axis]-angVelocity[_axis]);
                        }
                    }

                    //simple collision detection
                    var zPosition = this.originalPosition[rgbaIndex+2]+translation[2]*multiplier-groundHeight;
                    var collisionK = 1;
                    if (zPosition<0) {
                        var normalForce = -zPosition*collisionK-velocity[2]*collisionK/10;
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
                    var nextTranslation  = [
                            translation[0]*2 - this.lastLastTranslation[rgbaIndex] + acceleration[0]*dt*dt,
                            translation[1]*2 - this.lastLastTranslation[rgbaIndex+1] + acceleration[1]*dt*dt,
                            translation[2]*2 - this.lastLastTranslation[rgbaIndex+2] + acceleration[2]*dt*dt
                    ];
                    var nextVelocity = [
                        (nextTranslation[0] - translation[0])/dt,
                        (nextTranslation[1] - translation[1])/dt,
                        (nextTranslation[2] - translation[2])/dt];

                    this.translation[rgbaIndex] = nextTranslation[0];
                    this.translation[rgbaIndex+1] = nextTranslation[1];
                    this.translation[rgbaIndex+2] = nextTranslation[2];

                    this.velocity[rgbaIndex] = nextVelocity[0];
                    this.velocity[rgbaIndex+1] = nextVelocity[1];
                    this.velocity[rgbaIndex+2] = nextVelocity[2];

                    var angAcceleration = [rForce[0]/I, rForce[1]/I, rForce[2]/I];
                    angVelocity = [angVelocity[0] + angAcceleration[0]*dt, angVelocity[1] + angAcceleration[1]*dt, angVelocity[2] + angAcceleration[2]*dt];
                    var rotationDelta  = [angVelocity[0]*dt, angVelocity[1]*dt, angVelocity[2]*dt];
                    var quaternionDelta = this._quaternionFromEuler(rotationDelta, "ZYX");

                    this.angVelocity[rgbaIndex] = angVelocity[0];
                    this.angVelocity[rgbaIndex+1] = angVelocity[1];
                    this.angVelocity[rgbaIndex+2] = angVelocity[2];

                    var nextQuaternion = this._multiplyQuaternions(quaternion, quaternionDelta);

                    //nextQuaternion = this._normalize4D(nextQuaternion);
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

                        var quaternion = this._multiplyQuaternions([this.quaternion[rgbaIndex], this.quaternion[rgbaIndex+1], this.quaternion[rgbaIndex+2], this.quaternion[rgbaIndex+3]],
                            [this.originalQuaternion[rgbaIndex], this.originalQuaternion[rgbaIndex+1], this.originalQuaternion[rgbaIndex+2], this.originalQuaternion[rgbaIndex+3]]);
                        var rotation = this._eulerFromQuaternion(quaternion);

                        cells[index[0]][index[1]][index[2]].object3D.position.set(position[0], position[1], position[2]);
                        cells[index[0]][index[1]][index[2]].object3D.rotation.set(rotation[0], rotation[1], rotation[2]);
                    }
                }

                this._swapArrays("velocity", "lastVelocity");
                this._swap3Arrays("translation", "lastTranslation", "lastLastTranslation");
                this._swapArrays("quaternion", "lastQuaternion");
                this._swapArrays("angVelocity", "lastAngVelocity");
            },

            _addVectors: function(vector1, vector2){
                return [vector1[0]+vector2[0], vector1[1]+vector2[1], vector1[2]+vector2[2]];
            },

            _multiplyVectorScalar: function(vector, scalar){
                return [vector[0]*scalar, vector[1]*scalar, vector[2]*scalar];
            },

            _averageQuaternions: function(quaternion1, quaternion2){

                var x = quaternion1[0], y = quaternion1[1], z = quaternion1[2], w = quaternion1[3];
                var _x1 = quaternion1[0], _y1 = quaternion1[1], _z1 = quaternion1[2], _w1 = quaternion1[3];
                var _x2 = quaternion2[0], _y2 = quaternion2[1], _z2 = quaternion2[2], _w2 = quaternion2[3];

                // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

                var cosHalfTheta = w * _w2 + x * _x2 + y * _y2 + z * _z2;

                if ( cosHalfTheta < 0 ) {

                    _w1 = - _w2;
                    _x1 = - _x2;
                    _y1 = - _y2;
                    _z1 = - _z2;

                    cosHalfTheta = - cosHalfTheta;

                } else {

                    _w1 = _w2;
                    _x1 = _x2;
                    _y1 = _y2;
                    _z1 = _z2;

                }

                if ( cosHalfTheta >= 1.0 ) {

                    _w1 = w;
                    _x1 = x;
                    _y1 = y;
                    _z1 = z;

                    return [_x1, _y1, _z1, _w1];

                }

                var halfTheta = Math.acos( cosHalfTheta );
                var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

                if ( Math.abs( sinHalfTheta ) < 0.001 ) {

                    _w1 = 0.5 * ( w + _w1 );
                    _x1 = 0.5 * ( x + _x1 );
                    _y1 = 0.5 * ( y + _y1 );
                    _z1 = 0.5 * ( z + _z1 );

                    return [_x1, _y1, _z1, _w1];

                }

                var ratioA = Math.sin( ( 0.5 ) * halfTheta ) / sinHalfTheta,
                ratioB = Math.sin( 0.5 * halfTheta ) / sinHalfTheta;

                _w1 = ( w * ratioA + _w1 * ratioB );
                _x1 = ( x * ratioA + _x1 * ratioB );
                _y1 = ( y * ratioA + _y1 * ratioB );
                _z1 = ( z * ratioA + _z1 * ratioB );

                return [_x1, _y1, _z1, _w1];
            },

            _invertQuaternion: function(quaternion){
                return this._normalize4D([quaternion[0]*-1, quaternion[1]*-1, quaternion[2]*-1, quaternion[3]]);
            },

            _shearIndex: function(neighborAxis, axis){
                if (neighborAxis == 0){
                    if (axis == 1) return 0;
                    if (axis == 2) return 1;
                    else console.warn("problem");
                } else if (neighborAxis == 1){
                    if (axis == 0) return 2;
                    if (axis == 2) return 3;
                    else console.warn("problem");
                } else if (neighborAxis == 2){
                    if (axis == 0) return 4;
                    if (axis == 1) return 5;
                    else console.warn("problem");
                } else console.warn("problem");
                return 0;
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

            _quaternionFromEuler: function (euler, order) {

                var c1 = Math.cos(euler[0] / 2);
                var c2 = Math.cos(euler[1] / 2);
                var c3 = Math.cos(euler[2] / 2);
                var s1 = Math.sin(euler[0] / 2);
                var s2 = Math.sin(euler[1] / 2);
                var s3 = Math.sin(euler[2] / 2);

                if (order == "ZYX") return [s1 * c2 * c3 - c1 * s2 * s3, c1 * s2 * c3 + s1 * c2 * s3, c1 * c2 * s3 - s1 * s2 * c3, c1 * c2 * c3 + s1 * s2 * s3];//zyx
                if (order == "XYZ") return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3];//xyz
                console.warn("unknown rotation order " + order);
                return [0,0,0];
            },

            _clamp: function ( x, a, b ) {
                return ( x < a ) ? a : ( ( x > b ) ? b : x );
            },

            _setFromRotationMatrix: function (te) {//xyz
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
                    //todo this is a bug - no signal connected
                    return 0;
                }
                var polarity = Math.floor(type/4);
                type = type%4;


                var frequency = wireMeta[1];
                var period = 1/frequency;
                var phase = wireMeta[2];
                var currentPhase = ((time + phase*period)%period)/period;

                var invert = 1;
                if (wireMeta[3] == 1) invert = -1;
                if (polarity) invert = -invert;

                if (type == 0){
                    return invert*0.5*Math.sin(2*Math.PI*currentPhase);
                }
                if (type == 1){
                    var pwm = wireMeta[3];
                    if (currentPhase < pwm) return 0.5*invert;
                    return -0.5*invert;
                }
                if (type == 2){
                    return invert*(0.5-currentPhase);
                }
                if (type == 3){
                    if (currentPhase < 0.5) return invert*(currentPhase*2-0.5);
                    return invert*(0.5-(currentPhase-0.5)*2);
                }
                return 0;
            },

            _swapArrays: function(array1Name, array2Name){
                var temp = this[array1Name];
                this[array1Name] = this[array2Name];
                this[array2Name] = temp;
            },

            _swap3Arrays: function(array1Name, array2Name, array3Name){
                var temp = this[array3Name];
                this[array3Name] = this[array2Name];
                this[array2Name] = this[array1Name];
                this[array1Name] = temp;
            },

            reset: function(){
                if (!this.textureSize) return;//no cells
                var textureSize = this.textureSize[0]*this.textureSize[1];

                var self = this;
                this._loopCells(lattice.getCells(), function(cell){
                    var index = cell.getIndex().sub(lattice.get("cellsMin"));
                    var rgbaIndex = 4*self.cellsIndexMapping[index.x][index.y][index.z];
                    var position = [self.originalPosition[rgbaIndex], self.originalPosition[rgbaIndex+1], self.originalPosition[rgbaIndex+2]];
                    cell.object3D.position.set(position[0], position[1], position[2]);
                    var rotation = self._eulerFromQuaternion([self.originalQuaternion[rgbaIndex], self.originalQuaternion[rgbaIndex+1], self.originalQuaternion[rgbaIndex+2], self.originalQuaternion[rgbaIndex+3]]);
                    cell.object3D.rotation.set(rotation[0], rotation[1], rotation[2]);
                });

                this.lastLastTranslation = new Float32Array(textureSize*4);
                this.lastTranslation = new Float32Array(textureSize*4);
                this.translation = new Float32Array(textureSize*4);
                this.lastVelocity = new Float32Array(textureSize*4);
                this.velocity = new Float32Array(textureSize*4);
                this.acceleration = new Float32Array(textureSize*4);
                this.lastQuaternion = new Float32Array(textureSize*4);
                this.quaternion = new Float32Array(textureSize*4);
                this.lastAngVelocity = new Float32Array(textureSize*4);
                this.angVelocity = new Float32Array(textureSize*4);
                for (var i=0;i<textureSize;i++){
                    this.lastQuaternion[4*i+3] = 1;//w = 1
                    this.quaternion[4*i+3] = 1;
                }
				this._setupGPU(this.textureSize[0]);
            }

        });


        return EMSimLattice;


    });