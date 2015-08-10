/**
 * Created by aghassaei on 8/10/15.
 */


//hold and display data for various fields

define(['underscore', 'threeModel'], function(_, threeModel){

    function ESimField(data, offset, resolution, height){

        this._object3D = new THREE.Object3D();
        this._setData(data, offset, resolution, height);

        threeModel.sceneAdd(this._object3D);
        this.hide();
    }

    ESimField.prototype._setData = function(data, offset, resolution, height){
        this._destroyData();
        this._data = data;
        this._max = _.max(data);
        this._min = _.min(data);
        this._resolution = resolution;

        this._offset = offset;
        this._setObject3DPosition(offset, resolution, height);

        this._threeObjects = this._createThreeObjects(data, offset, 1/resolution, height, this._object3D);
    };

    ESimField.prototype._setObject3DPosition = function(offset, resolution, height){
        this._object3D.position.set(offset.x, offset.y, offset.z+height/resolution);
    };

    ESimField.prototype._createThreeObjects = function(data, offset, size, height, object3D){
        var threeObjects = [];
        for (var x=0;x<data.length;x++){
            threeObjects.push([]);
            for (var y=0;y<data[0].length;y++){
                var box = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), this._materialForVal(data[x][y][height]));
                box.position.set(x*size, y*size, 0);
                object3D.add(box);
                threeObjects[x].push(box);
            }
        }
        return threeObjects;
    };

    ESimField.prototype._materialForVal = function(val){
        return new THREE.MeshLambertMaterial({color:this._colorForVal(val)});
    };

    ESimField.prototype._colorForVal = function(val){
        if (val == 1) console.log("here");
        return new THREE.Color(1-val, val, val);
        var scaledVal = (val - this._min)/(this._max - this._min) * (1-0)+ 0;
        console.log(scaledVal);
        console.log(this._min);
        console.log(this._max);
    };

    ESimField.prototype.show = function(height){
        console.log(height);
        if (height < 0 || this._data[0][0][height] === undefined) {
            console.warn("height " + height + " is out of range");
            return;
        }

        for (var x=0;x<this._threeObjects.length;x++){
            for (var y=0;y<this._threeObjects[x].length;y++){
                this._threeObjects[x][y].material.color.set(this._colorForVal(this._data[x][y][height]));
            }
        }

        this._setObject3DPosition(this._offset, this._resolution, height);
        this._object3D.visible = true;
        threeModel.render();
    };

    ESimField.prototype.hide = function(){
        this._object3D.visible = false;
    };

    ESimField.prototype._loop = function(data, callback){
        for (var x=0;x<data.length;x++){
            for (var y=0;y<data[0].length;y++){
                for (var z=0;z<data[0][0].length;z++){
                    callback(data[x][y][z], x, y, z, this);
                }
            }
        }
    };

    ESimField.prototype.destroy = function(){
        this._destroyData();
        threeModel.sceneRemove(this._object3D);
        this._object3D = null;
    };

    ESimField.prototype._destroyData = function(){
        if (this._data) this._loop(this._data, function(data){
            data = null;
        });
        this._data = null;
        this._min = null;
        this._max = null;
        this._offset = null;
        this._resolution = null;

    };


    return ESimField;

});