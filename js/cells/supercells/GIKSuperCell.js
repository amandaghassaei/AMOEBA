/**
 * Created by aghassaei on 5/26/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'superCell', 'gikCell'],
    function(_, THREE, three, lattice, appState, DMASuperCell, GIKCell){

    var unitGeos = {};
    var materials = {};

    function makePartWithLength(length){
        var geo = new THREE.BoxGeometry(lattice.xScale(0),lattice.yScale(0),lattice.zScale(0));
        geo.applyMatrix(new THREE.Matrix4().makeScale(length, 1, 1));
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(length/2-0.5, 0, 0));
        return geo;
    }

    GIKSuperCell = function(json, superCell){
        DMASuperCell.call(this, json, superCell);
    };
    GIKSuperCell.prototype = Object.create(DMASuperCell.prototype);

    GIKSuperCell.prototype._makeSubCellForIndex = function(json, callback){
        callback(new GIKCell(json, this));
    };

    GIKSuperCell.prototype._rotateCell = function(object3D){
        if (!this.index) return object3D;
        if (this.getAbsoluteIndex().z%2 != 0) object3D.rotateZ(Math.PI/2);
        return object3D;
    };

    GIKSuperCell.prototype._getGeometry = function(){
        var length = this.getLength() + 1;
        var key = "length"+length;
        if (!unitGeos[key]) unitGeos[key] = makePartWithLength(length);
        return unitGeos[key];
    };

    GIKSuperCell.prototype.getMaterial = function(returnTHREEObject){
        if (returnTHREEObject){
            return DMASuperCell.prototype.getMaterial.call(this, returnTHREEObject);
        }
        if (!materials[this.material]) materials[this.material] = {};
        var length = this.getLength();
        if (!materials[this.material]["length" + (length+1)]) {
            materials[this.material]["length" + (length+1)] =
            {
                material: this.material,
                cellsMin: new THREE.Vector3(0,0,0),
                cellsMax: new THREE.Vector3(length, 0, 0),
                dimensions: new THREE.Vector3(length+1, 1, 1)
            };
        }
        console.log(materials[this.material]);
        return materials[this.material]["length" + (length+1)];
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

    return GIKSuperCell;
});