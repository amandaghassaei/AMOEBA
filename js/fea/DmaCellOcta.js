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

DMAFaceOctaCell.prototype._buildCellMesh = function(){
    return DMACell.prototype._buildCellMesh.call(this, unitFaceOctaGeo);
};

DMAFaceOctaCell.prototype._doMeshTransformations = function(mesh){
    if (this.indices.z%2!=0) mesh.rotation.set(0, 0, Math.PI);
};

DMAFaceOctaCell.prototype.calcHighlighterPosition = function(face){

    var direction = face.normal;
    if (face.normal.z<0.99) direction = null;//only highlight horizontal faces

    var position = this.getPosition();
    position.z += face.normal.z*dmaGlobals.lattice.zScale()/2;
    return {index: _.clone(this.indices), direction:direction, position:position};
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FREEFORM CONNECTED/////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAFreeFormOctaCell(indices, scale, parentCellPos, parentCellQuat, direction, parentType){
    DMAFreeFormCell.call(this, indices, scale, parentCellPos, parentCellQuat, direction, parentType);
}
DMAFreeFormOctaCell.prototype = Object.create(DMAFreeFormCell.prototype);

DMAFreeFormOctaCell.prototype._buildCellMesh = function(){
    return DMACell.prototype._buildCellMesh.call(this, unitFaceOctaGeo);
};

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

DMAFreeFormOctaCell.prototype.calcHighlighterPosition = function(face){
    var direction = face.normal.clone();
    direction.applyQuaternion(this.cellMesh.quaternion);

    var position = this.getPosition();
    var zScale = this.zScale();
    position.x += direction.x*zScale/2;
    position.y += direction.y*zScale/2;
    position.z += direction.z*zScale/2;

    return {index: _.clone(this.indices), direction:direction, position:position};
};

DMAFreeFormOctaCell.prototype.getType = function(){
    return "octa";
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

//todo highlighter pos



///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////VERTEX CONNECTED///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


var unitVertexOcta = new THREE.OctahedronGeometry(1/Math.sqrt(2));

function DMAVertexOctaCell(indices, scale){
    DMACell.call(this, indices, scale);
}
DMAVertexOctaCell.prototype = Object.create(DMACell.prototype);

DMAVertexOctaCell.prototype._buildCellMesh = function(){//abstract mesh representation of cell
    return DMACell.prototype._buildCellMesh.call(this, unitVertexOcta);
};

DMAVertexOctaCell.prototype.calcHighlighterPosition = function(face, point){

    var position = this.getPosition();
    var direction = null;

    var xScale = dmaGlobals.lattice.xScale();
    if (point.x < position.x+xScale/4 && point.x > position.x-xScale/4){
        if (point.y > position.y-xScale/4 && point.y < position.y+xScale/4){
            if (face.normal.z > 0) {
                direction = new THREE.Vector3(0,0,1);
                position.z += dmaGlobals.lattice.zScale()/2;
            }
            else {
                direction = new THREE.Vector3(0,0,-1);
                position.z -= dmaGlobals.lattice.zScale()/2;
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
