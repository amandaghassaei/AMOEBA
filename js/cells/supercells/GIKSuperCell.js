/**
 * Created by aghassaei on 5/26/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'superCell', 'gikCell'],
    function(_, THREE, three, lattice, appState, DMASuperCell, GIKCell){

    var unitGeos = {};

    function makePartWithLength(length){
        var geo = new THREE.BoxGeometry(lattice.xScale(0),lattice.yScale(0),lattice.zScale(0));
        geo.applyMatrix(new THREE.Matrix4().makeScale(length, 1, 1));
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(length/2-0.5, 0, 0));
        return geo;
    }

    function GIKSuperCell(json, superCell){
        this.length  = json.length || appState.get("superCellRange").x;
        DMASuperCell.call(this, json, superCell);
    }
    GIKSuperCell.prototype = Object.create(DMASuperCell.prototype);

    GIKSuperCell.prototype._getSuperCellRange = function(){
        if (this.length) return new THREE.Vector3(this.length, 1, 1);
        console.warn("no length property for gik super cell");
        return null;
    };

    GIKSuperCell.prototype._makeSubCellForIndex = function(json, callback){
        json.materialName = this.materialName;
        callback(new GIKCell(json, this));
    };

    GIKSuperCell.prototype._rotateCell = function(object3D){
        if (!this.index) return object3D;
        if (this.index.z%2 != 0) object3D.rotateZ(Math.PI/2);
        return object3D;
    };

    GIKSuperCell.prototype.getLength = function(){
        return this.length;
    };

    GIKSuperCell.prototype._getGeometry = function(){
        var key = "length"+this.length;
        if (!unitGeos[key]) unitGeos[key] = makePartWithLength(this.length);
        return unitGeos[key];
    };

    GIKSuperCell.prototype._buildWireframe = function(mesh){
        var wireframe = new THREE.BoxHelper(mesh);
        wireframe.material.color.set(0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    GIKSuperCell.prototype._getMeshName = function(){
        return "cell";
    };

    GIKSuperCell.prototype._isMiddleLayer = function(){
        return false;
    };

    GIKSuperCell.prototype._isTopLayerCell = function(){
        return this.superCell === null || this.superCell === undefined;
    };

    GIKSuperCell.prototype.toJSON = function(){
        var data = DMASuperCell.prototype.toJSON.call(this);
        if (!this.length) console.warn("no length assigned to gik supercell");
        data.length = this.length;
        return data;
    };

    GIKSuperCell.prototype.destroy = function(){
        DMASuperCell.prototype.destroy.call(this);
        this.length = null;
    };

    return GIKSuperCell;
});