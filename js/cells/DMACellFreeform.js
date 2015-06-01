/**
 * Created by aghassaei on 4/14/15.
 */


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FREEFORM SUPERCLASS////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAFreeFormCell(index, parentCellPos, parentCellQuat, direction, parentType){//no rigid lattice structure for cells
    this.parentPos = parentCellPos;
    this.parentQuaternion = parentCellQuat;
    this.parentDirection = direction;
    this.parentType = parentType;
    DMACell.call(this, index);
}
DMAFreeFormCell.prototype = Object.create(DMACell.prototype);

DMAFreeFormCell.prototype._calcPosition = function(){//todo this might not be necessary - put in lattice
    var position = {};
    var zScale = globals.lattice.zScale();
    position.x = this.parentPos.x+this.parentDirection.x*zScale/2;
    position.y = this.parentPos.y+this.parentDirection.y*zScale/2;
    position.z = this.parentPos.z+this.parentDirection.z*zScale/2;
    return position;
};

DMAFreeFormCell.prototype.calcHighlighterPosition = function(face){
    //var direction = face.normal.clone().applyEuler(this.mesh.rotation);
    var direction = face.normal.clone();
    direction.applyQuaternion(this.mesh.quaternion);
    var position = this.getPosition();
    position.add(direction.clone().multiplyScalar(this.zScale()/2));
    return {index: _.clone(this.index), direction:direction, position:position};
};

DMAFreeFormCell.prototype.toJSON = function(){
    var json = DMACell.prototype.toJSON.call(this);
    _.extend(json, {
        parentPosition: this.parentPos,
        parentOrientation: this.parentQuaternion,
        direction: this.parentDirection,
        parentType: this.parentType,
        type: this.getType()
    });
    return json;
};



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////OCTA///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAFreeFormOctaCell(index, parentCellPos, parentCellQuat, direction, parentType){
    DMAFreeFormCell.call(this, index, parentCellPos, parentCellQuat, direction, parentType);
}
DMAFreeFormOctaCell.prototype = Object.create(DMAFreeFormCell.prototype);

DMAFreeFormOctaCell.prototype._doMeshTransformations = function(mesh){

    if (!this.parentDirection) {
        this.parentDirection = new THREE.Vector3(0,0,1);
        this.parentQuaternion = new THREE.Quaternion();
        this.parentPos = new THREE.Vector3(0,0,0);
    }
    var direction = this.parentDirection.clone();
    var zAxis = new THREE.Vector3(0,0,1);
    zAxis.applyQuaternion(this.parentQuaternion);
    var quaternion = new THREE.Quaternion().setFromUnitVectors(zAxis, direction);
    console.log(quaternion.clone());
    quaternion.multiply(this.parentQuaternion);

    var zAlignment = direction.sub(zAxis).length();
    if ((this.parentType == "octa" && zAlignment < 0.1) || this.parentType == "tetra"){
        console.log("yes");
        var zRot = new THREE.Quaternion().setFromAxisAngle(this.parentDirection, Math.PI);
        zRot.multiply(quaternion);
        quaternion = zRot;
    }

    mesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
};

DMAFreeFormOctaCell.prototype._initParts = function(){
    var parts  = [];
    parts.push(new DMAOctaTroxPart(1, this));
    return parts;
};

DMAFreeFormOctaCell.prototype.getType = function(){
    return "octa";
};

DMAFreeFormOctaCell.prototype._getGeometry = function(){
    return unitFaceOctaGeo;
};

DMAFreeFormOctaCell.prototype.xScale = function(){
    return 1;
};

DMAFreeFormOctaCell.prototype.yScale = function(){
    return this.xScale()/2*Math.sqrt(3);
};

DMAFreeFormOctaCell.prototype.zScale = function(){
    return 2/Math.sqrt(6);
};




///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////TETRA//////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


var unitCellGeo2 = new THREE.TetrahedronGeometry(Math.sqrt(3/8));
unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
unitCellGeo2.applyMatrix(new THREE.Matrix4().makeRotationX((Math.PI-Math.atan(2*Math.sqrt(2)))/2));

function DMAFreeFormTetraCell(index, parentCellPos, parentCellQuat, direction, parentType){
    DMAFreeFormCell.call(this, index, parentCellPos, parentCellQuat, direction, parentType);
}
DMAFreeFormTetraCell.prototype = Object.create(DMAFreeFormCell.prototype);

DMAFreeFormTetraCell.prototype._doMeshTransformations = function(mesh){
    var direction = this.parentDirection.clone();
    var zAxis = new THREE.Vector3(0,0,1);
    zAxis.applyQuaternion(this.parentQuaternion);
    var quaternion = new THREE.Quaternion().setFromUnitVectors(zAxis, direction);
    quaternion.multiply(this.parentQuaternion);

    var zComponent = direction.sub(zAxis).length();
    console.log(zComponent);
    console.log(new THREE.Euler().setFromQuaternion(quaternion));
    if (zComponent >= 1){
        console.log("yes");
        console.log("");
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

DMAFreeFormTetraCell.prototype._initParts = function(){
    var parts  = [];
    parts.push(new DMATetraTroxPart(1, this));
    return parts;
};

DMAFreeFormTetraCell.prototype.xScale = function(){
    return 1;
};

DMAFreeFormTetraCell.prototype.yScale = function(){
    return this.xScale()/2*Math.sqrt(3);
};

DMAFreeFormTetraCell.prototype.zScale = function(){
    return 2/Math.sqrt(24);
};

DMAFreeFormTetraCell.prototype._getGeometry = function(){
    return unitCellGeo2;
};

