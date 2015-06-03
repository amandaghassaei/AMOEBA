/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
    unitGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

    var unitGeoInverted = unitGeo.clone();
    unitGeoInverted.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

    function TetraFaceCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    TetraFaceCell.prototype = Object.create(DMACell.prototype);

    TetraFaceCell.prototype._getGeometry = function(){//abstract mesh representation of cell
        if (this.index.z%2 ==0) return unitGeo;//todo need this?
        return unitGeoInverted;
    };

    TetraFaceCell.prototype._rotateCell = function(object3D){
        var zIndex = this.index.z;
        if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) object3D.rotateZ(Math.PI/3);
        return object3D;
    };

    return TetraFaceCell;
});