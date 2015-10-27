/**
 * Created by aghassaei on 6/26/15.
 */

define(['underscore', 'stlLoader', 'part', 'bin!kennyTechPartSTL'], function(_, THREE, DMAPart, stl){

    var loader = new THREE.STLLoader();
    var unitGeo = loader.parse(stl);
    var unitScale = 1/6.9597;
    unitGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));

    function PartSubclass(type, parent){
        DMAPart.call(this, type, parent);
    }
    PartSubclass.prototype = Object.create(DMAPart.prototype);

    PartSubclass.prototype._getGeometry = function(){
        return unitGeo;
    };

    return PartSubclass;
});