/**
 * Created by aghassaei on 5/28/15.
 */


function StaplerAssembler(){
    Assembler.call(this);
}
StaplerAssembler.prototype = Object.create(Assembler.prototype);

StaplerAssembler.prototype._configureAssemblerMovementDependencies = function(){
    this.zAxis.add(this.stock.getObject3D());
    this.xAxis.add(this.zAxis);
    this.frame.add(this.xAxis);
    this.frame.add(this.yAxis);
    this.object3D.add(this.frame);
    this.object3D.add(this.substrate);
};

StaplerAssembler.prototype._getTotalNumMeshes = function(){
    return 5;
};

StaplerAssembler.prototype._loadSTls = function(doAdd){

    function geometryScale(geometry){
        var unitScale = 1;
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        return geometry;
    }

    var loader = new THREE.STLLoader();
    loader.load("assets/stls/stapler/frame.stl", function(geometry){
        doAdd(geometryScale(geometry), "frame");
    });
    loader.load("assets/stls/stapler/zStage.stl", function(geometry){
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
}