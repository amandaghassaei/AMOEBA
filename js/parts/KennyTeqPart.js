/**
 * Created by aghassaei on 6/26/15.
 */

define(['underscore', 'three', 'part', 'bin!kennyTeqPartSTL', 'stlLoader'], function(_, THREE, DMAPart, kennyPart){

    var loader = new THREE.STLLoader();
    var unitGeo = loader.parse(kennyPart);
    var unitScale = 1/6.9597;
    unitGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));

    function KennyTeqPart(type, parent){
        DMAPart.call(this, type, parent);
    }
    KennyTeqPart.prototype = Object.create(DMAPart.prototype);

    KennyTeqPart.prototype._getGeometry = function(){
        return unitGeo;
    };

    return KennyTeqPart;
});