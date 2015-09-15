/**
 * Created by aghassaei on 9/14/15.
 */


define(['underscore', 'stlLoader', 'gikPart', 'bin!dnaLegoBrickSTL', 'bin!dnaLegoBrick1x1STL'], function(_, THREE, GIKPart, stl, stl1by1){

    var loader = new THREE.STLLoader();
    var unitGeo = preProcessGeo(loader.parse(stl));
    var unitGeo1by1 = preProcessGeo(loader.parse(stl1by1));

    function preProcessGeo(geo){
        geo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.54));
        return geo;
    }

    function DNALegoPart(index, parent){
        GIKPart.call(this, index, parent);
    }
    DNALegoPart.prototype = Object.create(GIKPart.prototype);

    DNALegoPart.prototype._getGeometry = function(){
        if (this.parentCell.getLength() == 1) return unitGeo1by1;
        return unitGeo;
    };

    return DNALegoPart;
});