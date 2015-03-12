/**
 * Created by aghassaei on 3/9/15.
 */


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FACE CONNECTED/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


var unitFaceOctaGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
unitFaceOctaGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
unitFaceOctaGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

function DMAFaceOctaCell(indices, scale){
    DMACell.call(this, indices, scale);
}
DMAFaceOctaCell.prototype = Object.create(DMACell.prototype);

DMAFaceOctaCell.prototype._initParts = function(){
    var parts  = [];
    for (var i=0;i<3;i++){
        parts.push(new DMATrianglePart(i, this));
    }
    return parts;
};

DMAFaceOctaCell.prototype._doMeshTransformations = function(mesh){
    if (this.indices.z%2!=0) mesh.rotation.set(0, 0, Math.PI);
};

DMAFaceOctaCell.prototype.getGeometry = function(){
    return unitFaceOctaGeo;
};

DMAFaceOctaCell.prototype.calcHighlighterPosition = function(face){
    if (face.normal.z<0.99) return {index: _.clone(this.indices)};//only highlight horizontal faces
    var direction = face.normal;
    var position = this.getPosition();
    position.z += face.normal.z*this.zScale()/2;
    return {index: _.clone(this.indices), direction:direction, position:position};
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FREEFORM CONNECTED/////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAFreeFormOctaCell(indices, scale, parentCellPos, parentCellQuat, direction, parentType){
    DMAFreeFormCell.call(this, indices, scale, parentCellPos, parentCellQuat, direction, parentType);
}
DMAFreeFormOctaCell.prototype = Object.create(DMAFreeFormCell.prototype);

DMAFreeFormOctaCell.prototype._doMeshTransformations = function(mesh){

    var direction = this.parentDirection.clone();
    var zAxis = new THREE.Vector3(0,0,1);
    zAxis.applyQuaternion(this.parentQuaternion);
    var quaternion = new THREE.Quaternion().setFromUnitVectors(zAxis, direction);
    quaternion.multiply(this.parentQuaternion);

    if ((this.parentType == "octa" && direction.sub(zAxis).length() < 0.1) || this.parentType == "tetra"){
        var zRot = new THREE.Quaternion().setFromAxisAngle(this.parentDirection, Math.PI);
        zRot.multiply(quaternion);
        quaternion = zRot;
    }

    var eulerRot = new THREE.Euler().setFromQuaternion(quaternion);
    mesh.rotation.set(eulerRot.x, eulerRot.y, eulerRot.z);
};

DMAFreeFormOctaCell.prototype._initParts = function(){
    var parts  = [];
    for (var i=0;i<3;i++){
        parts.push(new DMATrianglePart(i, this));
    }
    return parts;
};

DMAFreeFormOctaCell.prototype.getType = function(){
    return "octa";
};

DMAFreeFormOctaCell.prototype.getGeometry = function(){
    return unitFaceOctaGeo;
};

DMAFreeFormOctaCell.prototype.zScale = function(scale){
    if (!scale) scale = dmaGlobals.lattice.get("scale");
    return 2*scale/Math.sqrt(6);
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////EDGE CONNECTED/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAEdgeOctaCell(indices, scale){
    DMAFaceOctaCell.call(this, indices, scale);
}
DMAEdgeOctaCell.prototype = Object.create(DMAFaceOctaCell.prototype);

DMAEdgeOctaCell.prototype._doMeshTransformations = function(){};

//todo fix this
DMAEdgeOctaCell.prototype.calcHighlighterPosition = function(face){
    var direction = face.normal.clone();
    direction.applyQuaternion(this.cellMesh.quaternion);
    var position = this.getPosition();
    position.add(direction.clone().multiplyScalar(this.zScale()/2));
    return {index: _.clone(this.indices), direction:direction, position:position};
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////ROTATED EDGE CONNECTED/////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


var unitVertexOcta = new THREE.OctahedronGeometry(1/Math.sqrt(2));

function DMARotatedEdgeCell(indices, scale){
    DMACell.call(this, indices, scale);
}
DMARotatedEdgeCell.prototype = Object.create(DMACell.prototype);

DMARotatedEdgeCell.prototype._doMeshTransformations = function(mesh){
    mesh.rotation.set(0, 0, Math.PI/4);
};

DMARotatedEdgeCell.prototype.calcHighlighterPosition = function(face, point){

    var position = this.getPosition();
    var direction = new THREE.Vector3(0,0,0);
    var rad = this.xScale()*Math.sqrt(2)/6;

    var difference = new THREE.Vector3().subVectors(position, point);
    difference.divideScalar(this.zScale());
    if (Math.abs(difference.z) < 0.2){
        direction.z = 0;
    } else if (point.z < position.z) {
        direction.z = -1;
        position.z -= rad;
    } else {
        direction.z = 1;
        position.z += rad;
    }

    if (direction.z != 0){
        if (this.indices.z%2 == 0){
            if (point.x < position.x) {
                direction.x -= 1;
                position.x -= rad;
            }
            else position.x += rad;
            if (point.y < position.y) {
                direction.y -= 1;
                position.y -= rad;
            }
            else position.y += rad;
        } else {
            if (point.x > position.x) {
                direction.x += 1;
                position.x += rad;
            }
            else position.x -= rad;
            if (point.y > position.y) {
                direction.y += 1;
                position.y += rad;
            }
            else position.y -= rad;
        }
    } else {
        if (Math.abs(difference.x) > Math.abs(difference.y)){
            if (point.x > position.x) direction.x = 1;
            else direction.x = -1;
        } else {
            if (point.y > position.y) direction.y = 1;
            else direction.y = -1;
        }
        position.x += direction.x*this.xScale()/2;
        position.y += direction.y*this.yScale()/2;
    }

    return {index: _.clone(this.indices), direction:direction, position:position};
};

DMARotatedEdgeCell.prototype.zScale = function(scale){
    return this.xScale(scale)*Math.sqrt(2);
};

DMARotatedEdgeCell.prototype.getGeometry = function(){
    return unitVertexOcta;
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////VERTEX CONNECTED///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAVertexOctaCell(indices, scale){
    DMACell.call(this, indices, scale);
}
DMAVertexOctaCell.prototype = Object.create(DMACell.prototype);

DMAVertexOctaCell.prototype.calcHighlighterPosition = function(face, point){

    var position = this.getPosition();
    var direction = null;

    var xScale = this.xScale();
    if (point.x < position.x+xScale/4 && point.x > position.x-xScale/4){
        if (point.y > position.y-xScale/4 && point.y < position.y+xScale/4){
            if (face.normal.z > 0) {
                direction = new THREE.Vector3(0,0,1);
                position.z += this.zScale()/2;
            }
            else {
                direction = new THREE.Vector3(0,0,-1);
                position.z -= this.zScale()/2;
            }
        } else {
            if (point.y < position.y-xScale/4){
                direction = new THREE.Vector3(0,-1,0);
                position.y -= xScale/2;
            } else {
                direction = new THREE.Vector3(0,1,0);
                position.y += xScale/2;
            }
        }
    } else {
        if (point.x < position.x-xScale/4){
            direction = new THREE.Vector3(-1,0,0);
            position.x -= xScale/2;
        } else {
            direction = new THREE.Vector3(1,0,0);
            position.x += xScale/2;
        }
    }

    return {index: _.clone(this.indices), direction:direction, position:position};
};

DMAVertexOctaCell.prototype.getGeometry = function(){
    return unitVertexOcta;
};