/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.OctahedronGeometry(1/Math.sqrt(2));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    function OctaFaceCell(index, superCell){
        DMACell.call(this, index, superCell);
    }
    OctaFaceCell.prototype = Object.create(DMACell.prototype);

    OctaFaceCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    OctaFaceCell.prototype._rotateCell = function(object3D){
        if (!this.index) return object3D;
        if (this.getAbsoluteIndex().z%2 != 0) object3D.rotation.set(0, 0, Math.PI);
        return object3D;
    };

    OctaFaceCell.prototype._initParts = function(){
        var parts  = [];
        for (var i=0;i<3;i++){
            parts.push(new OctaFaceTriPart(i, this));
        }
        return parts;
    };

    OctaFaceCell.prototype.calcHighlighterParams = function(face){
        var direction = face.normal.clone().applyQuaternion(this.getAbsoluteOrientation());
        if (direction.z<0.99) return null;//only highlight horizontal faces
        return DMACell.prototype.calcHighlighterParams.call(this, face);
    };

    return OctaFaceCell;
});