/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
    unitGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

    function TetraStackedCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    TetraStackedCell.prototype = Object.create(DMACell.prototype);

    TetraStackedCell.prototype._getGeometry = function(){//abstract mesh representation of cell
        return unitGeo;
    };

    TetraStackedCell.prototype._rotateCell = function(object3D){
        if (this.index.z%2 != 0) object3D.rotateX(Math.PI);
        return object3D;
    };

    return TetraStackedCell;
});