/**
 * Created by aghassaei on 8/10/15.
 */


//hold and display data for various fields

define(['underscore', 'threeModel'], function(_, threeModel){

    function ESimField(data, offset, resolution){

        this._data = data;
        this._offset = offset;

        this._createThreeObjects(data, offset, 1/resolution);

    }

    ESimField.prototype._createThreeObjects = function(data, offset, size){
        var threeObjects = [];
        for (var x=0;x<data.length;x++){
            threeObjects.push([]);
            for (var y=0;y<data[0].length;y++){
                threeObjects[x].push([]);
                for (var z=0;z<data[0][0].length;z++){
                    var box = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshLambertMaterial({color:"#ff0000"}));
                    box.position.set(x*size+offset.x, y*size+offset.y, z*size+offset.z);
                    threeModel.sceneAdd(box);
                    threeObjects[x][y].push(box);
                }
            }
        }
        threeModel.render();
    };

    ESimField.prototype.show = function(height){
        var data = [];
        for (var x=0;x<this._data.length;x++){
            data.push([]);
            for (var y=0;y<this._data[x].length;y++){
                data[x].push(this._data[x][y][height]);
            }
        }

    };

    ESimField.prototype.hide = function(){


    };

    ESimField.prototype._loopCells = function(data, callback){
        for (var x=0;x<data.length;x++){
            for (var y=0;y<data[0].length;y++){
                for (var z=0;z<data[0][0].length;z++){
                    callback(data[x][y][z], x, y, z, this);
                }
            }
        }
    };


    return ESimField;

});