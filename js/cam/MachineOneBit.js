///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////ONE BIT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function OneBitBot(){
    Machine.call(this);
}
OneBitBot.prototype = Object.create(Machine.prototype);

OneBitBot.prototype.setMachinePosition = function(){
    if (!dmaGlobals.assembler) return;
    this.position = dmaGlobals.assembler.get("originPosition");
    var self = this;
    _.each(_.values(this.meshes), function(mesh){//todo add cell?
        mesh.position.set(self.position.x, self.position.y, self.position.z);
    });
    var stockPosition = dmaGlobals.assembler.get("stockPosition");
    this.cell.moveTo(stockPosition.x, "x");
    this.cell.moveTo(stockPosition.y, "y");
    this.cell.moveTo(stockPosition.z, "z");
    dmaGlobals.three.render();
};

OneBitBot.prototype._buildMeshes = function(callback){
    var meshes = [];
    var numMeshes = 7;
    function allLoaded(){
        numMeshes -= 1;
        return numMeshes <= 0;
    }
    function geometryScale(geometry){
        var unitScale = 0.05/2.78388;
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geometry;
    }
    var material = this.material;
    function meshPrep(geometry, name){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-10/2.78388,(-12.8-1.39194)/2.78388,0));
        meshes[name] = new THREE.Mesh(geometry, material);
        if (allLoaded()) callback(meshes);
    }
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/oneBitBot/zAxis.stl", function(geometry){
        geometryScale(geometry);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(5/2.78388,(-2.4+1.39194)/2.78388,(-0.8-1.9685)/2.78388));
        meshPrep(geometry, "zAxis");
    });
    loader.load("assets/stls/oneBitBot/zDrive.stl", function(geometry){
        geometryScale(geometry);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(5/2.78388,(-2.4+1.39194)/2.78388,0));
        meshPrep(geometry, "zDrive");
    });
    loader.load("assets/stls/oneBitBot/yAxisMount.stl", function(geometry){
        geometryScale(geometry);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(5/2.78388,0,0));
        meshPrep(geometry, "yAxisMount");
    });
    loader.load("assets/stls/oneBitBot/basePlate.stl", function(geometry){
        geometryScale(geometry);
        meshPrep(geometry, "basePlate");
    });
    loader.load("assets/stls/oneBitBot/footMount1.stl", function(geometry){
        geometryScale(geometry);
        meshPrep(geometry, "footMount1");
    });
    loader.load("assets/stls/oneBitBot/footMount2.stl", function(geometry){
        geometryScale(geometry);
        meshPrep(geometry, "footMount2");
    });
    loader.load("assets/stls/oneBitBot/backFootMount.stl", function(geometry){
        geometryScale(geometry);
        meshPrep(geometry, "backFootMount");
    });
};

OneBitBot.prototype._moveTo = function(x, y, z, speed, wcs, callback){
    var totalThreads = 3;
    function sketchyCallback(){
        totalThreads -= 1;
        if (totalThreads > 0) return;
        callback();
    }
    var startingPos = this.meshes["zAxis"].position.clone();
    speed = this._normalizeSpeed(startingPos, x, y, this._reorganizeSpeed(speed));
    this._moveXAxis(startingPos.x, x, "x", speed.x, sketchyCallback);
    this._moveYAxis(startingPos.y, y, "y", speed.y, sketchyCallback);
    this._moveZAxis(startingPos.z, z, "z", speed.z, sketchyCallback);
};

OneBitBot.prototype._moveXAxis = function(startingPos, target, axis, speed, callback){
    if (target == null || target === undefined) {
        callback();
        return;
    }
    this._animateObjects([this.meshes["zAxis"], this.meshes["zDrive"], this.meshes["yAxisMount"], this.cell], axis, speed, startingPos, target, callback);
};
OneBitBot.prototype._moveYAxis = function(startingPos, target, axis, speed, callback){
    if (target == null || target === undefined) {
        callback();
        return;
    }
    this._animateObjects([this.meshes["zAxis"], this.meshes["zDrive"],  this.cell], axis, speed, startingPos, target, callback);
};
OneBitBot.prototype._moveZAxis = function(startingPos, target, axis, speed, callback){
    if (target == null || target === undefined) {
        callback();
        return;
    }
    this._animateObjects([this.meshes["zAxis"], this.cell], axis, speed, startingPos, target, callback);
};