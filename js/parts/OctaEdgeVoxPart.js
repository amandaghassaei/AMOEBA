/**
 * Created by aghassaei on 5/26/15.
 */

define(['underscore', 'stlLoader', 'part', 'bin!octaEdgeVoxPartSTL'], function(_, THREE, DMAPart, voxPart){

    var loader = new THREE.STLLoader();
    var unitGeo = loader.parse(voxPart);
    unitGeo.computeBoundingBox();
    var unitScale = 0.706/unitGeo.boundingBox.max.y;
    unitGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
    unitGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,0.09));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));

    function OctaEdgeVoxPart(type, parent){
        DMAPart.call(this, type, parent);
    }
    OctaEdgeVoxPart.prototype = Object.create(DMAPart.prototype);

    OctaEdgeVoxPart.prototype._getGeometry = function(){
        return unitGeo;
    };

    return OctaEdgeVoxPart;
});