/**
 * Created by aghassaei on 5/26/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'superCell', 'gikCell', 'dnaBrickCell'],
    function(_, THREE, three, lattice, appState, DMASuperCell, GIKCell, DNABrickCell){

    var unitGeos = {};

    function makePartWithLength(length){
        var geo = new THREE.BoxGeometry(lattice.xScale(),lattice.yScale(),lattice.zScale());
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
        if (lattice.get("latticeType") == "dnaBricks"){
            callback(new DNABrickCell(json, this));
            return;
        }
        callback(new GIKCell(json, this));
    };

    GIKSuperCell.prototype._rotateCell = function(object3D){
        if (!this.index) return object3D;
        object3D.rotateZ(lattice._zIndexRotation(this.index));
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

    GIKSuperCell.prototype.getMinPosition = function(){//for assembly
        var position = this.getAbsolutePosition();
        var oppPosition = this.applyAbsoluteRotation(new THREE.Vector3(3,0,0));
        oppPosition.add(position);
        position.x = Math.min(position.x, oppPosition.x);
        position.y = Math.max(position.y, oppPosition.y);
        return position;
    };

    GIKSuperCell.prototype._buildWireframe = function(mesh){
        var wireframe = new THREE.BoxHelper(mesh);
        wireframe.material.color.set(0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    GIKSuperCell.prototype._isBottomLayer = function(){
        return true;
    };

    GIKSuperCell.prototype._isMiddleLayer = function(){
        return false;
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