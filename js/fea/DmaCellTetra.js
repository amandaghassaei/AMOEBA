/**
 * Created by aghassaei on 3/9/15.
 */

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FACE CONNECTED OCTA////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

var unitCellGeo = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));
unitCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,Math.sqrt(3/8)-1/Math.sqrt(6)));

var unitCellGeoUpsideDown = unitCellGeo.clone();
unitCellGeoUpsideDown.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

function DMATetraFaceCell(indices, scale){
    DMACell.call(this, indices, scale);
}
DMATetraFaceCell.prototype = Object.create(DMACell.prototype);

DMATetraFaceCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
    var zIndex = this.indices.z;
    if (zIndex%2 ==0) return DMACell.prototype._buildCellMesh.call(this);
    return DMACell.prototype._buildCellMesh.call(this, unitCellGeoUpsideDown);
};

DMATetraFaceCell.prototype._doMeshTransformations = function(mesh){
    var zIndex = this.indices.z;
    if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) mesh.rotateZ(Math.PI/3);
};

DMATetraFaceCell.prototype._getGeometry = function(){
    return unitCellGeo;
};



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////EDGE CONNECTED OCTA////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function DMATetraEdgeCell(indices, scale){
    DMATetraFaceCell.call(this, indices, scale);
}
DMATetraEdgeCell.prototype = Object.create(DMATetraFaceCell.prototype);

DMATetraEdgeCell.prototype._doMeshTransformations = function(){};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FREEFORM CONNECTED/////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


var unitCellGeo2 = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));

function DMAFreeFormTetraCell(indices, scale, parentCellPos, parentCellQuat, direction, parentType){
    DMAFreeFormCell.call(this, indices, scale, parentCellPos, parentCellQuat, direction, parentType);
}
DMAFreeFormTetraCell.prototype = Object.create(DMAFreeFormCell.prototype);

DMAFreeFormTetraCell.prototype._doMeshTransformations = function(mesh){
    var direction = this.parentDirection.clone();
    var zAxis = new THREE.Vector3(0,0,1);
    zAxis.applyQuaternion(this.parentQuaternion);
    var quaternion = new THREE.Quaternion().setFromUnitVectors(zAxis, direction);
    quaternion.multiply(this.parentQuaternion);

    if (this.parentType == "octa" && direction.sub(zAxis).length() > 0.1){//only do this if connecting to octa
        var zRot = new THREE.Quaternion().setFromAxisAngle(this.parentDirection, Math.PI);
        zRot.multiply(quaternion);
        quaternion = zRot;
    }

    var eulerRot = new THREE.Euler().setFromQuaternion(quaternion);
    mesh.rotation.set(eulerRot.x, eulerRot.y, eulerRot.z);
};

DMAFreeFormTetraCell.prototype.getType = function(){
    return "tetra";
};

DMAFreeFormTetraCell.prototype.zScale = function(scale){
    if (!scale) scale = dmaGlobals.lattice.get("scale");
    return 2*scale/Math.sqrt(24);
};

DMAFreeFormTetraCell.prototype._getGeometry = function(){
    return unitCellGeo2;
};


