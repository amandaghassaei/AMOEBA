/**
 * Created by aghassaei on 5/26/15.
 */


(function () {

var unitPartGeo1, unitPartGeo2, unitPartGeo3;

//import part geometry
var loader = new THREE.STLLoader();
loader.load("assets/stls/parts/trianglePart.stl", function(geometry){

    unitPartGeo1 = geometry;
    unitPartGeo1.computeBoundingBox();
    var unitScale = 1.2/unitPartGeo1.boundingBox.max.y;
    unitPartGeo1.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    unitPartGeo1.applyMatrix(new THREE.Matrix4().makeTranslation(0.25,-0.6, -0.45));
    unitPartGeo1.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));

    unitPartGeo2 = unitPartGeo1.clone();
    unitPartGeo2.applyMatrix(new THREE.Matrix4().makeRotationZ(2*Math.PI/3));

    unitPartGeo3 = unitPartGeo1.clone();
    unitPartGeo3.applyMatrix(new THREE.Matrix4().makeRotationZ(-2*Math.PI/3));
});

function OctaFaceTriPart(type, parent){
    DMAPart.call(this, type, parent);
}
OctaFaceTriPart.prototype = Object.create(DMAPart.prototype);

OctaFaceTriPart.prototype._getGeometry = function(index){
    switch(index){
        case 0:
            return unitPartGeo1;
        case 1:
            return unitPartGeo2;
        case 2:
            return unitPartGeo3;
    }
    console.warn("no geometry for index " + index);
    return null;
};

self.OctaFaceTriPart = OctaFaceTriPart;
})();