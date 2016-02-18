/**
 * Created by aghassaei on 1/11/16.
 */


define(['underscore', 'backbone', 'emSimCell', 'threeModel', 'lattice', 'three', 'emWire'],
    function(_, Backbone, EMSimCell, three, lattice, THREE, EMWire){


    var EMSimLattice = Backbone.Model.extend({

        defaults: {
            wires: {}
        },

        initialize: function(){

        },

        setCells: function(cells){
            this.destroyCells();
            this.cells = this._initEmptyArray(cells);
            this._loopCells(cells, function(cell, x, y, z, self){
                self.cells[x][y][z] = new EMSimCell(cell);
            });
            this._loopCellsWithNeighbors(function(cell, neighbors){
                cell.setNeighbors(neighbors);
            });
            this._precomputeWires(this.cells);
        },

        _precomputeWires: function(cells){
            var num = 1;
            this._loopCells(cells, function(cell){
                cell.setWireGroup(num++, true);
            });
            this._loopCells(cells, function(cell){
                cell.propagateWireGroup();
            });
            this._calcNumberDCConnectedComponents(cells);
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

        destroyCells: function(){
            if (this.cells){
                this.loopCells(function(cell){
                    cell.destroy();
                });
            }
        },

        loopCells: function(callback){
            this._loopCells(this.cells, callback);
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

        _loopCellsWithNeighbors: function(callback){
            var cells = this.cells;
            if (!cells) {
                console.warn('no cells array');
                return;
            }
            var sizeX = cells.length;
            var sizeY = cells[0].length;
            var sizeZ = cells[0][0].length;
            this.loopCells(function(cell, x, y, z, self){
                var neighbors = self._calcNeighbors(cells, x, y, z, sizeX, sizeY, sizeZ);
                callback(cell, neighbors, x, y, z, self);
            });
        },

        calcNeighbors: function(cell){
            var index = cell.getAbsoluteIndex();
            index.sub(this.get("cellsMin"));
            return this._calcNeighbors(this.cells, index.x, index.y, index.z, this.cells.length, this.cells[0].length, this.cells[0][0].length);
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

        _neighborLookup: function(index){
            switch (index){
                case 0:
                    return 'x-';
                case 1:
                    return 'x+';
                case 2:
                    return 'y-';
                case 3:
                    return 'y+';
                case 4:
                    return 'z-';
                case 5:
                    return 'z+';
            }
        },

        _neighborSign: function(index){
            if (index%2 == 0) return -1;
            return 1;
        },

        _neighborAxis: function(index){
            if (index > 3) return 'z';
            if (index > 1) return 'y';
            return 'x';
        },

        _neighborOffset: function(index, latticePitch){
            var offset = new THREE.Vector3(0,0,0);
            var axisName = this._neighborAxis(index);
            offset[axisName] = this._neighborSign(index) * latticePitch[axisName];
            return offset;
        },

        _torqueAxis: function(neighbAxis, axis){
            if ('x' != neighbAxis && 'x' != axis) return 'x';
            if ('y' != neighbAxis && 'y' != axis) return 'y';
            return 'z';
        },

        _sign: function(val){
            if (val>0) return 1;
            return -1;
        },


        iter: function(dt, gravity, shouldRender){
            var self = this;
            var latticePitch = lattice.getPitch();
            this._loopCells(this.cells, function(cell){
                if (cell.isFixed()) return;
                var mass = cell.getMass();
                var material = cell.getMaterial();

                var cellVelocity = cell.getVelocity();
                var cellTranslation = cell.getTranslation();

                var neighbors = cell.getNeighbors();

                //var cellRotation = cell.getRotation();
                //var angularVelocity = cell.getAngularVelocity();

                var Ftotal = gravity.clone().multiplyScalar(mass);
                var Rtotal = new THREE.Vector3(0,0,0);
                var Rcontrib = 0;

                _.each(neighbors, function(neighbor, index){
                    if (neighbor === null) return;

                    var nominalD = self._neighborOffset(index, latticePitch);
                    var halfNominalD = nominalD.clone().multiplyScalar(0.5);
                    var neighbRotatedHalfNomD = neighbor.applyRotation(halfNominalD.clone());
                    var rotatedHalfNomD = cell.applyRotation(halfNominalD.clone());
                    var rotatedNominalD = rotatedHalfNomD.clone().add(neighbRotatedHalfNomD);

                    var neighborTranslation = neighbor.getTranslation();
                    var neighborVelocity = neighbor.getVelocity();

                    var D = neighborTranslation.sub(cellTranslation).add(nominalD);//offset between neighbors (with nominal component)
                    var relativeVelocity = cellVelocity.clone().sub(neighborVelocity);

                    var k = neighbor.makeCompositeParam(neighbor.getMaterial().getK(), material.getK());
                    var damping = 1/100;//this is arbitrary for now

                    var offset = D.clone().sub(rotatedNominalD);
                    var force = offset.clone().multiplyScalar(k).sub(relativeVelocity.multiplyScalar(damping));//kD-dv

                    Ftotal.add(force);

                    ////non-axial rotation
                    //var quaternion = new THREE.Quaternion().setFromUnitVectors(nominalD.clone().normalize(),
                    //    D.clone().normalize());
                    //
                    ////axial rotation
                    //var axis = rotatedNominalD;//neighbRotatedHalfNomD
                    //var neghborRotation = neighbor.getRotation();
                    //var angle = axis.clone().normalize().dot(neghborRotation);
                    //var torsion = new THREE.Quaternion().setFromAxisAngle(nominalD.clone().normalize(), angle);
                    //
                    //quaternion.multiply(torsion);
                    //var euler = new THREE.Euler().setFromQuaternion(quaternion);
                    //
                    //var rotation = new THREE.Vector3(euler.x, euler.y, euler.z);
                    //var weightedRotation = rotation.clone().multiplyScalar(k);
                    //Rtotal.add(weightedRotation);
                    //Rcontrib += k;
                    //
                    //var torque = nominalHalfD.cross(offset.multiplyScalar(k/1000));
                    //Ttotal.add(torque);
                    //var bendingTorque = neighbor.getRotation().sub(cellRotation).multiplyScalar(k/1000000);
                    //Ttotal.add(bendingTorque);
                    //
                    //var neighborRotation = neighbor.getRotation();
                    //var bend = cellRotation.clone().sub(neighborRotation);
                    //var bendForce = new THREE.Vector3(0,0,0);
                    //_.each(bend, function(val, key){
                    //    if (key == neighborAxis) return;
                    //    var bendAxis = self._torqueAxis(key, neighborAxis);
                    //    bendForce[bendAxis] = val*k/1000000000;
                    //});
                    //Ftotal.add(cell.applyRotation(bendForce));

                });


                cell.applyForce(Ftotal, dt);
                //cell.setRotation(Rtotal.multiplyScalar(1/Rcontrib), dt);
            });
            this.loopCells(function(cell){
                cell.update(shouldRender);
            });
        },

        reset: function(){
            this.loopCells(function(cell){
                cell.reset();
            });
        },

        _getCellAtIndex: function(index){
            return this.cells[index.x][index.y][index.z];
        },



    });


    return new EMSimLattice();

});