/**
 * Created by aghassaei on 6/8/15.
 */



define(['underscore', 'three', 'gikPart', 'bin!gikPartLowPolySTL', 'bin!gikEndPartLowPolySTL', 'stlLoader'], function(_, THREE, GIKPart, gikPartLowPoly, gikEndPartLowPoly){

    var loader = new THREE.STLLoader();
    var unitGeo = preProcessGeo(loader.parse(gikPartLowPoly));
    var unitGeoEnd = preProcessGeo(loader.parse(gikEndPartLowPoly), true);

    function preProcessGeo(geo, endPart){
        geo.computeBoundingBox();
        if (endPart) geo.applyMatrix(new THREE.Matrix4().makeTranslation(-(geo.boundingBox.min.x+0.5),
            -(geo.boundingBox.min.y+geo.boundingBox.max.y)/2, -(geo.boundingBox.min.z+geo.boundingBox.max.z)/2));
        else geo.applyMatrix(new THREE.Matrix4().makeTranslation(-(geo.boundingBox.min.x+geo.boundingBox.max.x)/2,
            -(geo.boundingBox.min.y+geo.boundingBox.max.y)/2, -(geo.boundingBox.min.z+geo.boundingBox.max.z)/2));
        var unitScale = 1/(1.2699999809265137);
        geo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        geo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geo;
    }

    function GIKPartLowPoly(index, parent){
        GIKPart.call(this, index, parent);
    }
    GIKPartLowPoly.prototype = Object.create(GIKPart.prototype);

    GIKPartLowPoly.prototype._getGeometry = function(){
        if (this._isEnd()) return unitGeoEnd;
        return unitGeo;
    };

    return GIKPartLowPoly;
});