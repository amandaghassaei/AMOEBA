/**
 * Created by aghassaei on 1/11/16.
 */


define(['underscore', 'backbone', 'emSimCell', 'threeModel', 'lattice'],
    function(_, Backbone, EMSimCell, three, lattice){


    var EMSimLattice = Backbone.Model.extend({

        defaults: {

        },

        initialize: function(){

        },

        setCells: function(cells){
            this.destroyCells();
            this.cells = this._initEmptyArray(cells);
            this._loopCells(cells, function(cell, x, y, z, self){
                self.cells[x][y][z] = new EMSimCell(cell);
            });
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

                callback(cell, neighbors, x, y, z, self);
            });
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

        _neighborAxis: function(index){
            if (index > 3) return 'z';
            if (index > 1) return 'y';
            return 'x';
        },

        _sign: function(val){
            if (val >0) return 1;
            return -1;
        },

        iter: function(dt, gravity, shouldRender){

            var self = this;
            var latticePitch = lattice.getPitch();
            console.log(latticePitch);
            this._loopCellsWithNeighbors(function(cell, neighbors){
                var material = cell.getMaterial();
                var mass = cell.getMass();
                var Ftotal = gravity.clone().multiplyScalar(mass);
                var velocity = cell.getVelocity();
                _.each(neighbors, function(neighbor, index){
                    if (neighbor === null) return;
                    var axis = self._neighborAxis(index);
                    var force = new THREE.Vector3(0,0,0);
                    var cellDelta = cell.getDeltaPosition();
                    var neighborDelta = neighbor.getDeltaPosition();
                    var length = latticePitch[axis];
                    var crossSectionalArea = 1;
                    _.each(force, function(val, key){
                        if (key == axis) return;
                        crossSectionalArea *= latticePitch[key];
                    });
                    //k=Y*Area/Length
                    var k = 10;//neighbor.compositeElasticModulus(material.getElasticMod())*crossSectionalArea/length/10000;
                    if (material.getID() == "brass") k =1000;
                    var d = k/100000;
                    _.each(force, function(val, key){
//                        if (key == axis) {
//                            force[key] =
//                        } else {
                            force[key] = k*(neighborDelta[key] - cellDelta[key]);
//                            force[key] -= d*(velocity[key]);
//                        }
                    });

                    Ftotal.add(force);
                });
                cell.applyForce(Ftotal, dt);
            });
            this.loopCells(function(cell){
                cell.update(shouldRender);
            });
        },

        reset: function(){
            this.loopCells(function(cell){
                cell.reset();
            });
            three.render();
        },

        getCellAtIndex: function(index){
            return this.cells[index.x][index.y][index.z];
        }


    });


    return new EMSimLattice();

});