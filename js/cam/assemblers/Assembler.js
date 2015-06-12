/**
 * Created by aghassaei on 5/28/15.
 */


var assemblerMaterial = new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading, transparent:true, opacity:0.5});

function Assembler(){

    this.stock = this._buildStock();
    this._positionStockRelativeToEndEffector(this.stock);
    this.object3D = new THREE.Object3D();
    globals.three.sceneAdd(this.object3D);
    var self = this;
    this._buildAssemblerComponents(function(){
        self._configureAssemblerMovementDependencies();
        globals.three.render();
    });

    this.setVisibility(globals.cam.isVisible());
}

Assembler.prototype._buildStock = function(){
    if (globals.lattice.makeSuperCell) return globals.lattice.makeSuperCell();
    return globals.lattice.makeCellForLatticeType({});
};

Assembler.prototype._positionStockRelativeToEndEffector = function(){
};

Assembler.prototype._buildAssemblerComponents = function(callback){
    var numMeshes = this._getTotalNumMeshes();
    if (numMeshes == 0) {
        callback();
        return;
    }

    function allLoaded(){
        numMeshes -= 1;
        return numMeshes <= 0;
    }

    var self = this;
    function doAdd(geometry, name){
        self[name] = new Component(geometry, assemblerMaterial);
        if (allLoaded()) callback();
    }

    this._loadSTls(doAdd);
};

Assembler.prototype._getTotalNumMeshes = function(){
    return 0;
};

Assembler.prototype._configureAssemblerMovementDependencies = function(){
};

Assembler.prototype.setVisibility = function(visible){
    this.object3D.visible = visible;
    this._setTranslucent();
    globals.three.render();
};

Assembler.prototype._setTranslucent = function(){
    //todo make stock transparent
    if (globals.appState.get("currentTab") == "cam"){
        assemblerMaterial.transparent = true;
    } else {
        assemblerMaterial.transparent = false;
    }
};





Assembler.prototype.postProcess = function(data, exporter){//override in subclasses

    var rapidHeight = globals.cam.get("rapidHeight");
    var safeHeight = globals.cam.get("safeHeight");
    var wcs = globals.cam.get("originPosition");

    var stockPosition = globals.cam.get("stockPosition");
    var stockNum = 0;//position of stock in stock array
    var multStockPositions = globals.cam.get("multipleStockPositions");
    var stockSeparation = globals.cam.get("stockSeparation");
    var stockArraySize = globals.cam.get("stockArraySize");
    var self = this;

    globals.lattice.rasterCells(globals.cam._getOrder(globals.cam.get("camStrategy")), function(cell){
        if (!cell) return;
        if (this.stockAttachedToEndEffector){
            data += self._postGetStock(exporter);
        } else {
            var thisStockPosition = _.clone(stockPosition);
            if (multStockPositions) {
                thisStockPosition.x += stockNum % stockArraySize.y * stockSeparation;
                thisStockPosition.y -= Math.floor(stockNum / stockArraySize.y) * stockSeparation;
                stockNum += 1;
                if (stockNum >= stockArraySize.x * stockArraySize.y) stockNum = 0;
            }
            data += self._postMoveXY(exporter, stockPosition.x-wcs.x, stockPosition.y-wcs.y);
            data += self._postPickUpStock(exporter, thisStockPosition, rapidHeight, wcs, safeHeight);
        }
        var cellPosition = cell.getPosition();
        data += self._postMoveXY(exporter, cellPosition.x-wcs.x, cellPosition.y-wcs.y);
        data += self._postReleaseStock(cellPosition, cell, exporter, rapidHeight, wcs, safeHeight);
        data += "\n";
    });
    return data;
};

Assembler.prototype._postMoveXY = function(exporter, x, y){
    return exporter.rapidXY(x, y);
};

Assembler.prototype._postPickUpStock = function(exporter, stockPosition, rapidHeight, wcs, safeHeight){
    var data = "";
    data += exporter.rapidZ(stockPosition.z-wcs.z+safeHeight);
    data += exporter.moveZ(stockPosition.z-wcs.z);
    data += this._postGetStock(exporter);
    data += exporter.moveZ(stockPosition.z-wcs.z+safeHeight);
    data += exporter.rapidZ(rapidHeight);
    return data;
};

Assembler.prototype._postGetStock = function(exporter){
    return exporter.addComment("get stock");
};

Assembler.prototype._postReleaseStock = function(cellPosition, cell, exporter, rapidHeight, wcs, safeHeight){
    var data = "";
    data += exporter.rapidZ(cellPosition.z-wcs.z+safeHeight);
    data += exporter.moveZ(cellPosition.z-wcs.z);
    data += exporter.addComment(JSON.stringify(cell.indices));
    data += exporter.moveZ(cellPosition.z-wcs.z+safeHeight);
    data += exporter.rapidZ(rapidHeight);
    return data;
};






Assembler.prototype.updateCellMode = function(){
//    this.stock.setMode();//todo fix this
    _.each(this.stock.cells, function(cell){
        cell.setMode();
    });
};

Assembler.prototype.pickUpStock = function(){
    this.stock.show();
};

Assembler.prototype.releaseStock = function(index){
    globals.lattice.showCellAtIndex(JSON.parse(index));
    this.stock.hide();
};

Assembler.prototype.pause = function(){
};

Assembler.prototype.moveMachine = function(){
    var origin = globals.cam.get("originPosition");
    this.object3D.position.set(origin.x, origin.y, origin.z);
    globals.three.render();
};

Assembler.prototype.moveTo = function(x, y, z, speed, wcs, callback){
    x = this._makeAbsPosition(x, wcs.x);
    y = this._makeAbsPosition(y, wcs.y);
    z = this._makeAbsPosition(z, wcs.z);
    this._moveTo(x, y, z, speed, wcs, callback);
};

Assembler.prototype._moveTo = function(x, y, z, speed, wcs, callback){
    var totalThreads = 3;
    function sketchyCallback(){
        totalThreads -= 1;
        if (totalThreads > 0) return;
        callback();
    }
    var startingPos = {x:this.xAxis.getPosition(), y:this.yAxis.getPosition(), z:this.zAxis.getPosition()};
    speed = this._normalizeSpeed(startingPos, x, y, this._reorganizeSpeed(speed));
    this.xAxis.moveTo(this._makeAxisVector(x, "x"), speed.x, sketchyCallback);
    this.yAxis.moveTo(this._makeAxisVector(y, "y"), speed.y, sketchyCallback);
    this.zAxis.moveTo(this._makeAxisVector(z, "z"), speed.z, sketchyCallback);
};

Assembler.prototype._makeAbsPosition = function(target, wcs){
    if (target == "" || target == null || target === undefined) return null;
    return parseFloat(target)+wcs;
};

Assembler.prototype._reorganizeSpeed = function(speed){
    var newSpeed = {};
    newSpeed.x = speed.xy;
    newSpeed.y = speed.xy;
    newSpeed.z = speed.z;
    return newSpeed;
};

Assembler.prototype._normalizeSpeed = function(startingPos, x, y, speed){//xy moves need speed normalization
    var normSpeed = {};
    if (x == "" || y == "") return speed;
    var deltaX = x-startingPos.x;
    var deltaY = y-startingPos.y;
    var totalDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    if (totalDistance == 0) return speed;
    normSpeed.x = Math.abs(deltaX/totalDistance*speed.x);
    normSpeed.y = Math.abs(deltaY/totalDistance*speed.y);
    normSpeed.z = speed.z;
    return normSpeed;
};

Assembler.prototype._makeAxisVector = function(position, axis){
    switch (axis){
        case "x":
            return {x:position, y:0, z:0};
        case "y":
            return {x:0, y:position, z:0};
        case "z":
            return {x:0, y:0, z:position};
        default:
            console.warn(axis + " axis not recognized");
            return null;
    }
};






Assembler.prototype.destroy = function(){
    this.stock.destroy();
    this.zAxis.destroy();
    this.xAxis.destroy();
    this.yAxis.destroy();
    this.frame.destroy();
    this.substrate.destroy();
    globals.three.sceneRemove(this.object3D);
    this.stock = null;
    this.zAxis = null;
    this.xAxis = null;
    this.yAxis = null;
    this.frame = null;
    this.substrate = null;
    this.object3D = null;
};
