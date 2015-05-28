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

StaplerAssembler.prototype._loadStls = function(callback){
    var meshes = [];
    var numMeshes = 5;
    function allLoaded(){
        numMeshes -= 1;
        return numMeshes <= 0;
    }
    function geometryScale(geometry){
        var unitScale = 1;
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geometry;
    }
    var material = assemblerMaterial;
    var self = this;
    function meshPrep(geometry, name){
        self[name] = new THREE.Mesh(geometry, material);
        if (allLoaded()) callback(meshes);
    }
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/stapler/frame.stl", function(geometry){
        meshPrep(geometryScale(geometry), "frame");
    });
    loader.load("assets/stls/stapler/zStage.stl", function(geometry){
        meshPrep(geometryScale(geometry), "zAxis");
    });
    loader.load("assets/stls/stapler/yStage.stl", function(geometry){
        meshPrep(geometryScale(geometry), "yAxis");
    });
    loader.load("assets/stls/stapler/xStage.stl", function(geometry){
        meshPrep(geometryScale(geometry), "xAxis");
    });
    loader.load("assets/stls/stapler/substrate.stl", function(geometry){
        meshPrep(geometryScale(geometry), "substrate");
    });
};