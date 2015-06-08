/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'part', 'bin!octaFaceTrianglePartSTL', 'stlLoader'], function(_, THREE, DMAPart, trianglePart){

    var loader = new THREE.STLLoader();
    var unitGeo = loader.parse(trianglePart);
    unitGeo.computeBoundingBox();
    var unitScale = 1.2/unitGeo.boundingBox.max.y;
    unitGeo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
    unitGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0.25,-0.6, -0.45));
    unitGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));

    function OctaFaceTriPart(type, parent){
        DMAPart.call(this, type, parent);
    }
    OctaFaceTriPart.prototype = Object.create(DMAPart.prototype);

    OctaFaceTriPart.prototype._getGeometry = function(){
        return unitGeo;
    };

    OctaFaceTriPart.prototype._rotatePart = function(mesh){
        switch(this.index){
            case 0:
                return mesh;
            case 1:
                return mesh.rotateZ(2*Math.PI/3);
            case 2:
                return mesh.rotateZ(-2*Math.PI/3);
            default:
                console.warn("uknown index " + this.index + " for part")
                return null;
        }
    };

    return OctaFaceTriPart;
});