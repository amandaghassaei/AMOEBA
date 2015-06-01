/**
 * Created by aghassaei on 5/26/15.
 */


var unitCellGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

var unitCellGeoUpsideDown = unitCellGeo.clone();
unitCellGeoUpsideDown.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

function TetraFaceCell(index, superCell){
    DMACell.call(this, index, superCell);
}
TetraFaceCell.prototype = Object.create(DMACell.prototype);

TetraFaceCell.prototype._getGeometry = function(){//abstract mesh representation of cell
    if (this.index.z%2 ==0) return unitCellGeo;//todo need this?
    return unitCellGeoUpsideDown;
};

TetraFaceCell.prototype._rotateCell = function(object3D){
    var zIndex = this.index.z;
    if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) object3D.rotateZ(Math.PI/3);
    return object3D;
};