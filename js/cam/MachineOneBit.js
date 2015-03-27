///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////ONE BIT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function OneBitBot(){
    Machine.call(this);
}
OneBitBot.prototype = Object.create(Machine.prototype);

OneBitBot.prototype._setDefaults = function(){
    Machine.prototype._setDefaults.call(this);
    dmaGlobals.assembler.set("stockFixed", true);
    var scale = dmaGlobals.lattice.get("scale");
    dmaGlobals.assembler.set("stockPosition", {x:1.8*scale,y:0,z:1.1*scale});
    dmaGlobals.assembler.set("rapidHeight", 2*scale);
};

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
    var numMeshes = 13;
    function allLoaded(){
        numMeshes -= 1;
        return numMeshes <= 0;
    }
    function geometryScale(geometry){
        var unitScale = 0.05/2.78388;
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-200,-283.84,30));
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        return geometry;
    }
    var material = this.material;
    function meshPrep(geometry, name){
        meshes[name] = new THREE.Mesh(geometry, material);
        if (allLoaded()) callback(meshes);
    }
    var loader = new THREE.STLLoader();
    loader.load("assets/stls/oneBitBot/zAxis.stl", function(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(100,-20.16,-85.37));
        meshPrep(geometryScale(geometry), "zAxis");
    });
    loader.load("assets/stls/oneBitBot/zDrive.stl", function(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(100,-20.16,-0));
        meshPrep(geometryScale(geometry), "zDrive");
    });
    loader.load("assets/stls/oneBitBot/yAxisMount.stl", function(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(100,0,0));
        meshPrep(geometryScale(geometry), "yAxisMount");
    });
    loader.load("assets/stls/oneBitBot/basePlate.stl", function(geometry){
        meshPrep(geometryScale(geometry), "basePlate");
    });
    loader.load("assets/stls/oneBitBot/footMount1.stl", function(geometry){
        meshPrep(geometryScale(geometry), "footMount1");
    });
    loader.load("assets/stls/oneBitBot/footMount2.stl", function(geometry){
        meshPrep(geometryScale(geometry), "footMount2");
    });
    loader.load("assets/stls/oneBitBot/backFootMount.stl", function(geometry){
        meshPrep(geometryScale(geometry), "backFootMount");
    });
    loader.load("assets/stls/oneBitBot/foot1.stl", function(geometry){
        var height = 70;
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(406.45,301.77,height));
        var geometry2 = geometry.clone();
        geometry2.applyMatrix(new THREE.Matrix4().makeTranslation(0,-141.42,0));
        meshPrep(geometryScale(geometry), "foot1A");
        meshPrep(geometryScale(geometry2), "foot1B");
    });
    loader.load("assets/stls/oneBitBot/foot2.stl", function(geometry){
        var geometry1 = geometry.clone();
        geometry1.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
        var height = 70;
        geometry1.applyMatrix(new THREE.Matrix4().makeTranslation(22.5,2,height));
        var geometry2 = geometry1.clone();
        geometry2.applyMatrix(new THREE.Matrix4().makeTranslation(142,0,0));

        var geometry3 = geometry.clone();
        geometry3.applyMatrix(new THREE.Matrix4().makeTranslation(35,450,height));
        var geometry4 = geometry3.clone();
        geometry4.applyMatrix(new THREE.Matrix4().makeTranslation(142,0,0));
        meshPrep(geometryScale(geometry1), "foot2A");
        meshPrep(geometryScale(geometry2), "foot2B");
        meshPrep(geometryScale(geometry3), "foot2C");
        meshPrep(geometryScale(geometry4), "foot2D");
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

OneBitBot.prototype._postPickUpStock = function(exporter, stockPosition, rapidHeight, wcs, safeHeight){
    if (exporter.engageZAxis) return exporter.engageZAxis("stock");
    else return Machine.prototype._postPickUpStock.call(this, exporter, stockPosition, rapidHeight, wcs, safeHeight);
};

OneBitBot.prototype._postReleaseStock = function(cellPosition, cell, exporter, rapidHeight, wcs, safeHeight){
    if (exporter.engageZAxis) return exporter.engageZAxis("cell", cellPosition, cell, wcs);
    else return Machine.prototype._postReleaseStock.call(this, cellPosition, cell, exporter, rapidHeight, wcs, safeHeight);
};