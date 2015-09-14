/**
 * Created by aghassaei on 9/14/15.
 */


define(['underscore', 'stlLoader', 'gikPart', 'bin!legoBrickSTL'], function(_, THREE, GIKPart, stl){

    var loader = new THREE.STLLoader();
    var unitGeo = preProcessGeo(loader.parse(stl));

    function preProcessGeo(geo){
        geo.computeBoundingBox();
        var unitScale = 1/(8.2);
        geo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geo;
    }

    function LegoPart(index, parent){
        GIKPart.call(this, index, parent);
    }
    LegoPart.prototype = Object.create(GIKPart.prototype);

    LegoPart.prototype._getGeometry = function(){
        return unitGeo;
    };

    return LegoPart;
});