/**
 * Created by aghassaei on 5/26/15.
 */


var unitFaceOctaGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
unitFaceOctaGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
unitFaceOctaGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

function OctaFaceCell(mode, indices){
    DMACell.call(this, mode, indices);
}
OctaFaceCell.prototype = Object.create(DMACell.prototype);

OctaFaceCell.prototype._initParts = function(){
    var parts  = [];
    for (var i=0;i<3;i++){
        parts.push(new DMATrianglePart(i, this));
    }
    return parts;
};

OctaFaceCell.prototype._rotateCell = function(object3D){
    if (this.indices && this.indices.z%2!=0) object3D.rotation.set(0, 0, Math.PI);
    return object3D;
};

OctaFaceCell.prototype._getGeometry = function(){
    return unitFaceOctaGeo;
};

OctaFaceCell.prototype.calcHighlighterPosition = function(face){
    if (face.normal.z<0.99) return {index: _.clone(this.indices)};//only highlight horizontal faces
    var direction = face.normal;
    var position = this.getPosition();
    position.z += face.normal.z*this.zScale()/2;
    return {index:_.clone(this.indices), direction:direction, position:position};
};