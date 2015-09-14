/**
 * Created by aghassaei on 9/14/15.
 */


define(['underscore', 'stlLoader', 'gikPart', 'bin!dnaLegoBrickSTL'], function(_, THREE, GIKPart, stl){

    var loader = new THREE.STLLoader();
    var unitGeo = preProcessGeo(loader.parse(stl));

    function preProcessGeo(geo){
        geo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        return geo;
    }

    function DNALegoPart(index, parent){
        GIKPart.call(this, index, parent);
    }
    DNALegoPart.prototype = Object.create(GIKPart.prototype);

    DNALegoPart.prototype._getGeometry = function(){
        return unitGeo;
    };

    return DNALegoPart;
});