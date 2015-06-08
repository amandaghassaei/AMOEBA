/**
 * Created by aghassaei on 6/8/15.
 */


define(['underscore', 'three', 'part', 'bin!octaEdgeVoxPartLowPolySTL', 'stlLoader'], function(_, THREE, DMAPart, voxLowPoly){

    var loader = new THREE.STLLoader();
    var unitGeo = loader.parse(voxLowPoly);
    unitGeo.computeBoundingBox();
    var unitScale = 0.706/unitGeo.boundingBox.max.y;
    unitGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));

    function OctaEdgeVoxPartLowPoly(type, parent){
        DMAPart.call(this, type, parent);
    }
    OctaEdgeVoxPartLowPoly.prototype = Object.create(DMAPart.prototype);

    OctaEdgeVoxPartLowPoly.prototype._getGeometry = function(){
        return unitGeo;
    };

    return OctaEdgeVoxPartLowPoly;
});