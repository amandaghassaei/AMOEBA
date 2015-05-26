/**
 * Created by aghassaei on 3/9/15.
 */


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////FACE CONNECTED/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


var unitFaceOctaGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
unitFaceOctaGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
unitFaceOctaGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

function DMAFaceOctaCell(indices, cellMode, partType){
    DMACell.call(this, indices, cellMode, partType);
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
    if (this.indices && this.indices.z%2!=0) mesh.rotation.set(0, 0, Math.PI);
};

DMAFaceOctaCell.prototype._getGeometry = function(){
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
////////////////////////EDGE CONNECTED/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAEdgeOctaCell(indices, cellMode, partType){
    DMAFaceOctaCell.call(this, indices, cellMode, partType);
}
DMAEdgeOctaCell.prototype = Object.create(DMAFaceOctaCell.prototype);

DMAEdgeOctaCell.prototype._doMeshTransformations = function(){};

//todo fix this
DMAEdgeOctaCell.prototype.calcHighlighterPosition = function(face){
    var direction = face.normal.clone();
    direction.applyQuaternion(this.mesh.quaternion);
    var position = this.getPosition();
    position.add(direction.clone().multiplyScalar(this.zScale()/2));
    return {index: _.clone(this.indices), direction:direction, position:position};
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////ROTATED EDGE CONNECTED/////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


var unitVertexOcta = new THREE.OctahedronGeometry(1/Math.sqrt(2));

function DMARotatedEdgeCell(indices, cellMode, partType){
    DMACell.call(this, indices, cellMode, partType);
}
DMARotatedEdgeCell.prototype = Object.create(DMACell.prototype);

DMARotatedEdgeCell.prototype._initParts = function(){
    return this.changePartType(globals.lattice.get("partType"));
};

DMARotatedEdgeCell.prototype.changePartType = function(type){
    var newParts = [];
    if (type == "vox"){
        newParts.push(new DMAEdgeVoxPart(0, this));
    } else if (type == "voxLowPoly"){
        newParts.push(new DMAEdgeVoxPartLowPoly(0, this));
    } else {
        console.warn("part type " + type + " not recognized");
        return;
    }
    if (!this.parts) return newParts;
    this.destroyParts();
    this.parts = newParts;
};

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

DMARotatedEdgeCell.prototype._getGeometry = function(){
    return unitVertexOcta;
};


///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////VERTEX CONNECTED///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function DMAVertexOctaCell(indices, cellMode, partType){
    DMACell.call(this, indices, cellMode, partType);
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

DMAVertexOctaCell.prototype._getGeometry = function(){
    return unitVertexOcta;
};