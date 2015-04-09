/**
 * Created by aghassaei on 4/9/15.
 */


(function () {

    var tetraTrox;

    //import part geometry
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/parts/troxTetra.stl", function(geometry){

        tetraTrox = geometry;
        tetraTrox.computeBoundingBox();
        var unitScale = 1/3.25;
        tetraTrox.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
//        tetraTrox.applyMatrix(new THREE.Matrix4().makeTranslation(0.25,-0.6, -0.45));
//        tetraTrox.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));
    });

    function DMATetraTroxPart(type, parent){
        DMAPart.call(this, type, parent);
    }
    DMATetraTroxPart.prototype = Object.create(DMAPart.prototype);

    DMATetraTroxPart.prototype._makeMeshForType = function(){
        console.log("mesh");
        var mesh = new THREE.Mesh(tetraTrox, partMaterial);
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMATetraTroxPart = DMATetraTroxPart;

    var octaTrox;

    //import part geometry
    loader.load("assets/stls/parts/troxOcta.stl", function(geometry){

        octaTrox = geometry;
        octaTrox.computeBoundingBox();
        var unitScale = 1/3.25;
        octaTrox.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
//        octaTrox.applyMatrix(new THREE.Matrix4().makeTranslation(0.25,-0.6, -0.45));
//        octaTrox.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/6));
    });

    function DMAOctaTroxPart(type, parent){
        DMAPart.call(this, type, parent);
    }
    DMAOctaTroxPart.prototype = Object.create(DMAPart.prototype);

    DMAOctaTroxPart.prototype._makeMeshForType = function(){
        var mesh = new THREE.Mesh(octaTrox, partMaterial);
        mesh.myPart = this;//need a ref back to this part
        return mesh;
    };

    self.DMAOctaTroxPart = DMAOctaTroxPart;

})();
