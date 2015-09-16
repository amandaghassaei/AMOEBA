/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cell'],
    function(_, THREE, three, lattice, appState, DMACell){

    var unitGeo = new THREE.Geometry();
    unitGeo.vertices = [
        new THREE.Vector3(0.7071067811865475, 0, 0),
        new THREE.Vector3(-0.7071067811865475, 0, 0),
        new THREE.Vector3(0, 0.7071067811865475, 0),
        new THREE.Vector3(0, -0.7071067811865475, 0),
        new THREE.Vector3(0, 0, 0.7071067811865475),
        new THREE.Vector3(0, 0, -0.7071067811865475)
    ];

    unitGeo.faces = [
        new THREE.Face3(2, 4, 0),
        new THREE.Face3(4, 3, 0),
        new THREE.Face3(3, 5, 0),
        new THREE.Face3(5, 2, 0),
        new THREE.Face3(2, 5, 1),
        new THREE.Face3(5, 3, 1),
        new THREE.Face3(3, 4, 1),
        new THREE.Face3(4, 2, 1)
    ];
    unitGeo.computeFaceNormals();
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-3*Math.PI/12));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.asin(2/Math.sqrt(2)/Math.sqrt(3))));

    function OctaFaceCell(json, superCell){
        DMACell.call(this, json, superCell);
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

    OctaFaceCell.prototype._initParts = function(callback){
        var self = this;
        require(['octaFaceTriPart'], function(OctaFaceTriPart){
            var parts  = [];
            for (var i=0;i<3;i++){
                parts.push(new OctaFaceTriPart(i, self));
            }
            callback(parts);
        });
    };

    OctaFaceCell.prototype.calcHighlighterParams = function(face){
        var direction = face.normal.clone().applyQuaternion(this.getAbsoluteOrientation());
        if (direction.z<0.99) return null;//only highlight horizontal faces
        return DMACell.prototype.calcHighlighterParams.call(this, face);
    };

    return OctaFaceCell;
});