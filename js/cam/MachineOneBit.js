///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////ONE BIT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function OneBitBot(){
    Machine.call(this);
}
OneBitBot.prototype = Object.create(Machine.prototype);

OneBitBot.prototype._setDefaults = function(){
    Machine.prototype._setDefaults.call(this);
    globals.cam.set("stockFixed", true);
    var scale = globals.lattice.get("scale");
    var xPos = (1.11*scale).toFixed(4);
    var zPos = (1.14*scale).toFixed(4);
    globals.cam.set("stockPosition", {x:xPos,y:0,z:zPos});
};

OneBitBot.prototype.setMachinePosition = function(){
    if (!globals.cam) return;
    this.position = globals.cam.get("originPosition");
    var self = this;
    _.each(_.values(this.meshes), function(mesh){//todo add cell?
        mesh.position.set(self.position.x, self.position.y, self.position.z);
    });
    var stockPosition = globals.cam.get("stockPosition");
    this.cell.moveTo(stockPosition.x, "x");
    this.cell.moveTo(stockPosition.y, "y");
    this.cell.moveTo(stockPosition.z, "z");
    globals.three.render();
};

OneBitBot.prototype._buildMeshes = function(callback){
    var meshes = [];
    var numMeshes = 8;
    function allLoaded(){
        numMeshes -= 1;
        return numMeshes <= 0;
    }
    function geometryScale(geometry){
        var unitScale = 1/70.710552;
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-52132.4, 1596.56, -594.083));//-2052.46, 62.8567, -23.3891
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geometry;
    }
    var material = this.material;
    function meshPrep(geometry, name){
        meshes[name] = new THREE.Mesh(geometry, material);
        if (allLoaded()) callback(meshes);
    }
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/oneBitBot/base.stl", function(geometry){
        meshPrep(geometryScale(geometry), "basePlate");
    });
    loader.load("assets/stls/oneBitBot/endEffector.stl", function(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(142,142,-125));
        meshPrep(geometryScale(geometry), "zAxis");
    });
    loader.load("assets/stls/oneBitBot/endEffectorPlate.stl", function(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(142,142,-0));
        meshPrep(geometryScale(geometry), "zDrive");
    });
    loader.load("assets/stls/oneBitBot/xAxis.stl", function(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(142,0,-0));
        meshPrep(geometryScale(geometry), "xAxis");
    });
    loader.load("assets/stls/oneBitBot/backYAxis.stl", function(geometry){
        meshPrep(geometryScale(geometry), "backYAxis");
    });
    loader.load("assets/stls/oneBitBot/backYFeet.stl", function(geometry){
        meshPrep(geometryScale(geometry), "backYFeet");
    });
    loader.load("assets/stls/oneBitBot/frontFeet.stl", function(geometry){
        meshPrep(geometryScale(geometry), "frontFeet");
    });
    loader.load("assets/stls/oneBitBot/xAxisFeet.stl", function(geometry){
        meshPrep(geometryScale(geometry), "xAxisFeet");
    });
};

OneBitBot.prototype._moveTo = function(x, y, z, speed, wcs, callback){
    var totalThreads = 3;
    function sketchyCallback(){
        totalThreads -= 1;
        if (totalThreads > 0) return;
        callback();
    }
    var startingPos = this.cell.getPosition();
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
    this._animateObjects([this.meshes["zAxis"], this.meshes["zDrive"], this.meshes["xAxis"], this.cell], axis, speed, startingPos, target, callback);
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

OneBitBot.prototype._postPickUpStock = function(exporter, stockPosition, rapidHeight, wcs, safeHeight){
    if (exporter.engageZAxis) return exporter.engageZAxis("stock");
    else return Machine.prototype._postPickUpStock.call(this, exporter, stockPosition, rapidHeight, wcs, safeHeight);
};

OneBitBot.prototype._postReleaseStock = function(cellPosition, cell, exporter, rapidHeight, wcs, safeHeight){
    if (exporter.engageZAxis) return exporter.engageZAxis("cell", cellPosition, cell, wcs);
    else return Machine.prototype._postReleaseStock.call(this, cellPosition, cell, exporter, rapidHeight, wcs, safeHeight);
};