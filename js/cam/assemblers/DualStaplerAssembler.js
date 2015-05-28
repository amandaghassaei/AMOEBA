/**
 * Created by aghassaei on 5/28/15.
 */

function DualStaplerAssembler(){
    StaplerAssembler.call(this);
}
DualStaplerAssembler.prototype = Object.create(StaplerAssembler.prototype);

DualStaplerAssembler.prototype._loadSTls = function(doAdd){

    function geometryScale(geometry){
//        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
//        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -4.3112));
        var unitScale = 20;
//        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geometry;
    }

    var loader = new THREE.STLLoader();
    loader.load("assets/stls/stapler/frame.stl", function(geometry){
        doAdd(geometryScale(geometry), "frame");
    });
    loader.load("assets/stls/stapler/zStageDual.stl", function(geometry){
        doAdd(geometryScale(geometry), "zAxis");
    });
    loader.load("assets/stls/stapler/yStage.stl", function(geometry){
        doAdd(geometryScale(geometry), "yAxis");
    });
    loader.load("assets/stls/stapler/xStage.stl", function(geometry){
        doAdd(geometryScale(geometry), "xAxis");
    });
    loader.load("assets/stls/stapler/substrate.stl", function(geometry){
        doAdd(geometryScale(geometry), "substrate");
    });
};