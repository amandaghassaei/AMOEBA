/**
 * Created by aghassaei on 5/26/15.
 */


(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/edgeVoxPart.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        var unitScale = 0.706/unitPartGeo.boundingBox.max.y;
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,0.09));
    });

    function OctaEdgeVoxPart(type){
        DMAPart.call(this, type);
    }
    OctaEdgeVoxPart.prototype = Object.create(DMAPart.prototype);

    OctaEdgeVoxPart.prototype._getGeometry = function(){
        return unitPartGeo;
    };

    self.OctaEdgeVoxPart = OctaEdgeVoxPart;

})();

(function () {

    var unitPartGeo;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/edgeVoxPartLowPoly.stl", function(geometry){

        unitPartGeo = geometry;
        unitPartGeo.computeBoundingBox();
        var unitScale = 0.706/unitPartGeo.boundingBox.max.y;
        unitPartGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    });

    function OctaEdgeVoxPartLowPoly(type, parent){
        DMAPart.call(this, type, parent);
    }
    OctaEdgeVoxPartLowPoly.prototype = Object.create(DMAPart.prototype);

    OctaEdgeVoxPartLowPoly.prototype._getGeometry = function(){
        return unitPartGeo;
    };

    self.OctaEdgeVoxPartLowPoly = OctaEdgeVoxPartLowPoly;

})();