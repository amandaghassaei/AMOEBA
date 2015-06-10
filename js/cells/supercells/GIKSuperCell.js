/**
 * Created by aghassaei on 5/26/15.
 */



define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'superCell', 'gikCell'],
    function(_, THREE, three, lattice, appState, DMASuperCell, GIKCell){

    var unitGeo = new THREE.BoxGeometry(lattice.xScale(0),lattice.yScale(0),lattice.zScale(0));

    GIKSuperCell = function(index, superCell){
        DMASuperCell.call(this, index, superCell);
    };
    GIKSuperCell.prototype = Object.create(DMASuperCell.prototype);

    GIKSuperCell.prototype._makeSubCellForIndex = function(index, material){
        return new GIKCell(index, material, this);
    };

    GIKSuperCell.prototype._rotateCell = function(object3D){
        if (!this.index) return object3D;
        if (this.getAbsoluteIndex().z%2 != 0) object3D.rotateZ(Math.PI/2);
        return object3D;
    };

    GIKSuperCell.prototype._getGeometry = function(){//todo , do this to mesh?
        var geo = unitGeo.clone();
        var length = this.getLength() + 1;
        geo.applyMatrix(new THREE.Matrix4().makeScale(length, 1, 1));
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(-length/2+0.5, 0, 0));
        return geo;
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