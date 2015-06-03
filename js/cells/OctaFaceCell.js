/**
 * Created by aghassaei on 5/26/15.
 */


define(['cell'], function(DMACell){

    var unitGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    function OctaFaceCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    OctaFaceCell.prototype = Object.create(DMACell.prototype);

    OctaFaceCell.prototype._initParts = function(){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new OctaFaceTriPart(i, this));
        }
        return parts;
    };

    OctaFaceCell.prototype._rotateCell = function(object3D){
        if (this.index && this.index.z%2!=0) object3D.rotation.set(0, 0, Math.PI);
        return object3D;
    };

    OctaFaceCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    OctaFaceCell.prototype.calcHighlighterPosition = function(face){
        if (face.normal.z<0.99) return {index: _.clone(this.index)};//only highlight horizontal faces
        var direction = face.normal;
        var position = this.getPosition();
        position.z += face.normal.z*this.zScale()/2;
        return {index:_.clone(this.index), direction:direction, position:position};
    };

    return OctaFaceCell;
});