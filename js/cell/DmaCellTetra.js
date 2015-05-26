/**
 * Created by aghassaei on 3/9/15.
 */

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FACE CONNECTED TETRA///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

var unitCellGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

var unitCellGeoUpsideDown = unitCellGeo.clone();
unitCellGeoUpsideDown.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

function DMATetraFaceCell(indices, scale, cellMode, partType){
    DMACell.call(this, indices, scale, cellMode, partType);
}
DMATetraFaceCell.prototype = Object.create(DMACell.prototype);

DMATetraFaceCell.prototype._buildMesh = function(){//abstract mesh representation of cell
    var zIndex = this.indices.z;
    if (zIndex%2 ==0) return DMACell.prototype._buildMesh.call(this);
    return DMACell.prototype._buildMesh.call(this, unitCellGeoUpsideDown);
};

DMATetraFaceCell.prototype._doMeshTransformations = function(mesh){
    var zIndex = this.indices.z;
    if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) mesh.rotateZ(Math.PI/3);
};

DMATetraFaceCell.prototype._getGeometry = function(){
    return unitCellGeo;
};



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////EDGE CONNECTED TETRA///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function DMATetraEdgeCell(indices, scale, cellMode, partType){
    DMATetraFaceCell.call(this, indices, scale, cellMode, partType);
}
DMATetraEdgeCell.prototype = Object.create(DMATetraFaceCell.prototype);

DMATetraEdgeCell.prototype._doMeshTransformations = function(){};
