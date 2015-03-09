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
    DMAInverseCell.call(this, indices, scale);
}
DMATetraFaceCell.prototype = Object.create(DMAInverseCell.prototype);

DMATetraFaceCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
    var zIndex = this.indices.z;
    if (zIndex%2 ==0) return this._superBuildCellMesh(unitCellGeo);
    return this._superBuildCellMesh(unitCellGeoUpsideDown);
};

DMATetraFaceCell.prototype._doMeshTransformations = function(mesh){
    var zIndex = this.indices.z;
    if (Math.abs(zIndex%4) == 2 || Math.abs(zIndex%4) == 3) mesh.rotateZ(Math.PI/3);
};



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////EDGE CONNECTED OCTA////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function DMATetraEdgeCell(indices, scale){
    DMATetraFaceCell.call(this, indices, scale);
}
DMATetraEdgeCell.prototype = Object.create(DMATetraFaceCell.prototype);

DMATetraEdgeCell.prototype._doMeshTransformations = function(){};

DMATetraEdgeCell.prototype.calcHighlighterPosition = function(face){

    //todo finish this
    var direction = face.normal;
    if (face.normal.z<0.99) direction = null;//only highlight horizontal faces
    var index = _.clone(this.indices);
    index.z = Math.floor(index.z/2);
    index.x = Math.floor(index.x/3);
    index.y = Math.floor(index.y/2);
    var position = dmaGlobals.lattice.getInvCellPositionForIndex(index);
    position.z += dmaGlobals.lattice.zScale();
    return {index: _.clone(this.indices), direction:direction, position:position};
};



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

DMAFreeFormTetraCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
    return this._superBuildCellMesh(unitCellGeo2);
};

DMAFreeFormTetraCell.prototype.getType = function(){
    return "tetra";
};

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

DMAFreeFormTetraCell.prototype.calcHighlighterPosition = function(face){

    var direction = face.normal.clone();
    direction.applyQuaternion(this.cellMesh.quaternion);

    var position = this.getPosition();
    var zScale = this.zScale();
    position.x += direction.x*zScale/2;
    position.y += direction.y*zScale/2;
    position.z += direction.z*zScale/2;

    return {index: _.clone(this.indices), direction:direction, position:position};
};

DMAFreeFormTetraCell.prototype.zScale = function(scale){
    if (!scale) scale = dmaGlobals.lattice.get("scale");
    return 2*scale/Math.sqrt(24);
};


