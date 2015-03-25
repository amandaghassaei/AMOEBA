/**
 * Created by fab on 3/16/15.
 */


function Machine() {

    this.hasStock = false;

    this.meshes = {};
    this.material = new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading, transparent:true, opacity:1});
    this.cell = this._makeStockCell();
    var self = this;
    this._buildMeshes(function(meshes){
        self.meshes = meshes;
        _.each(_.values(meshes), function(mesh){
            dmaGlobals.three.sceneAdd(mesh);
        });
        if (self.setMachinePosition) self.setMachinePosition();
        self.setVisibility();
    });
    this.setVisibility(false);
}

Machine.prototype.setVisibility = function(visible){
    if (visible == null || visible === undefined) {
        if (dmaGlobals.assembler) visible = dmaGlobals.assembler.isVisible();
        else visible = false;
    }
    if (visible && this.hasStock) this.cell.draw();
    else this.cell.hide();
    this._setAlpha();
    this._setMeshesVisiblity(visible);
    dmaGlobals.three.render();
};

Machine.prototype._setAlpha = function(){
    //todo make stock transparent
    if (dmaGlobals.appState.get("currentTab") == "cam"){
        this.material.opacity = 0.5;
    } else {
        this.material.opacity = 1;
    }
};

Machine.prototype._setMeshesVisiblity = function(visible){
    _.each(_.values(this.meshes), function(mesh){
        mesh.visible = visible;
    });
};

Machine.prototype._makeStockCell = function(){
    return dmaGlobals.lattice.makeCellForLatticeType(null, dmaGlobals.lattice.get("scale"));
};

Machine.prototype.updateCellType = function(){
    if (this.cell) this.cell.destroy();
    this.cell = this._makeStockCell();
    this.setVisibility();
};

Machine.prototype.updatePartType = function(){
    this.cell.destroyParts();
    this.cell.draw();
    this.setVisibility();
};

Machine.prototype.pickUpStock = function(){
    this.hasStock = true;
    this.cell.draw();
};

Machine.prototype.releaseStock = function(index){
    this.hasStock = false;
    dmaGlobals.lattice.showCellAtIndex(JSON.parse(index));
    this.cell.hide();
};

Machine.prototype.pause = function(){
};

Machine.prototype.moveTo = function(x, y, z, speed, wcs, callback){
    x = this._makeAbsPosition(x, wcs.x);
    y = this._makeAbsPosition(y, wcs.y);
    z = this._makeAbsPosition(z, wcs.z);
    this._moveTo(x, y, z, speed, wcs, callback);
};

Machine.prototype._moveTo = function(x, y, z, speed, wcs, callback){
    var totalThreads = 3;
    function sketchyCallback(){
        totalThreads -= 1;
        if (totalThreads > 0) return;
        callback();
    }
    var startingPos = this.cell.getPosition();
    speed = this._normalizeSpeed(startingPos, x, y, this._reorganizeSpeed(speed));
    this._moveAxis(startingPos.x, x, "x", speed.x, sketchyCallback);
    this._moveAxis(startingPos.y, y, "y", speed.y, sketchyCallback);
    this._moveAxis(startingPos.z, z, "z", speed.z, sketchyCallback);
};

Machine.prototype._makeAbsPosition = function(target, wcs){
    if (target == "" || target == null || target === undefined) return null;
    return parseFloat(target)+wcs;
};

Machine.prototype._reorganizeSpeed = function(speed){
    var newSpeed = {};
    newSpeed.x = speed.xy;
    newSpeed.y = speed.xy;
    newSpeed.z = speed.z;
    return newSpeed;
}

Machine.prototype._normalizeSpeed = function(startingPos, x, y, speed){//xy moves need speed normalization
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

Machine.prototype._animateObjects = function(objects, axis, speed, startingPos, target, callback){
    var increment = speed/5;//based on 1/10th of sec
    if (increment == 0) {
        if (callback) callback();
        return;
    }
    var direction = 1;
    if (target-startingPos < 0) direction = -1;
    increment = Math.max(increment, 0.00001)*direction;//need to put a min on the increment - other wise this stall out with floating pt tol
    var simSpeed = 50/dmaGlobals.assembler.get("simSpeed");//1/10th of sec
    this._incrementalMove(objects, axis, increment, startingPos, target, direction, callback, simSpeed);
};

Machine.prototype._incrementalMove = function(objects, axis, increment, currentPos, target, direction, callback, simSpeed){
    var self = this;
    setTimeout(function(){
        if ((target-currentPos)*direction <= 0) {
            if (callback) callback();
            return;
        }
        var nextPos = currentPos + increment;
        if (Math.abs(target-currentPos) < Math.abs(increment)) nextPos = target;//don't overshoot
        self._setPosition(objects, nextPos, axis);
        self._incrementalMove(objects, axis, increment, nextPos, target, direction, callback, simSpeed)
    },simSpeed);
};

Machine.prototype._setPosition = function(objects, nextPos, axis){
    _.each(objects, function(object){
        if (object instanceof DMACell) object.moveTo(nextPos, axis);
        else object.position[axis] = nextPos;
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////POST PROCESS//////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

Machine.prototype.postProcess = function(data, exporter){//override in subclasses

    var rapidHeight = dmaGlobals.assembler.get("rapidHeight");
    var safeHeight = dmaGlobals.assembler.get("safeHeight");
    var wcs = dmaGlobals.assembler.get("originPosition");

    var stockPosition = dmaGlobals.assembler.get("stockPosition");
    var stockNum = 0;//position of stock in stock array
    var multStockPositions = dmaGlobals.assembler.get("multipleStockPositions");
    var stockSeparation = dmaGlobals.assembler.get("stockSeparation");
    var stockArraySize = dmaGlobals.assembler.get("stockArraySize");
    var self = this;

    dmaGlobals.lattice.rasterCells(dmaGlobals.assembler._getOrder(dmaGlobals.assembler.get("camStrategy")), function(cell){
        if (!cell) return;
        var thisStockPosition = _.clone(stockPosition);
        if (multStockPositions) {
            thisStockPosition.x += stockNum % stockArraySize.y * stockSeparation;
            thisStockPosition.y -= Math.floor(stockNum / stockArraySize.y) * stockSeparation;
            stockNum += 1;
            if (stockNum >= stockArraySize.x * stockArraySize.y) stockNum = 0;
        }
        data += self._postPickUpStock(exporter, thisStockPosition, rapidHeight, wcs, safeHeight);
        data += self._postReleaseStock(cell, exporter, rapidHeight, wcs, safeHeight);
        data += "\n";
    });
    return data;
};

Machine.prototype._postPickUpStock = function(exporter, stockPosition, rapidHeight, wcs, safeHeight){
    var data = "";
    data += exporter.rapidXY(stockPosition.x-wcs.x, stockPosition.y-wcs.y);
    data += exporter.rapidZ(stockPosition.z-wcs.z+safeHeight);
    data += exporter.moveZ(stockPosition.z-wcs.z);
    data += exporter.addComment("get stock");
    data += exporter.moveZ(stockPosition.z-wcs.z+safeHeight);
    data += exporter.rapidZ(rapidHeight);
    return data;
};

Machine.prototype._postReleaseStock = function(cell, exporter, rapidHeight, wcs, safeHeight){
    var data = "";
    var cellPosition = cell.getPosition();
    data += exporter.rapidXY(cellPosition.x-wcs.x, cellPosition.y-wcs.y);
    data += exporter.rapidZ(cellPosition.z-wcs.z+safeHeight);
    data += exporter.moveZ(cellPosition.z-wcs.z);
    data += exporter.addComment(JSON.stringify(cell.indices));
    data += exporter.moveZ(cellPosition.z-wcs.z+safeHeight);
    data += exporter.rapidZ(rapidHeight);
    return data;
};


///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////DEALLOCATE////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

Machine.prototype.destroy = function(){
    this.cell.destroy();
    _.each(_.values(this.meshes), function(mesh){
        dmaGlobals.three.sceneRemove(mesh);
        mesh = null;
    });
    this.meshes = null;
    this.position = null;
    this.material = null;
};


///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////SHOPBOT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function Shopbot(){
    Machine.call(this);
}
Shopbot.prototype = Object.create(Machine.prototype);

Shopbot.prototype._buildMeshes = function(callback){
    var meshes = {};
    var material = this.material;
    (new THREE.STLLoader()).load("assets/stls/shopbot/shopbotEndEffector.stl", function(geometry){
        geometry.computeBoundingBox();
        var unitScale = 1.5/geometry.boundingBox.max.y;
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0, Math.sqrt(2)/2));
        var mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        meshes.endEffector = mesh;
        callback(meshes);
    });
};

Shopbot.prototype._moveAxis = function(startingPos, target, axis, speed, callback){
    if (target == null || target === undefined) {
        callback();
        return;
    }
    this._animateObjects([this.meshes.endEffector, this.cell], axis, speed, startingPos, target, callback);
};


///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////GOD///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function God(){
    Machine.call(this);
}
God.prototype = Object.create(Machine.prototype);

God.prototype._buildMeshes = function(callback){
    callback({});
};

God.prototype._moveTo = function(x, y, z, speed, wcs, callback){
    var startingPos = this.cell.getPosition();
    if (z != "" && z != null && z !== undefined){
        if (z>startingPos.z){//ignore z up moves
            this._setPosition(_.values(this.meshes).concat(this.cell), z, "z");
            callback();
            return;
        }
    } else {
        this._setPosition(_.values(this.meshes).concat(this.cell), x, "x");
        this._setPosition(_.values(this.meshes).concat(this.cell), y, "y");
        callback();
        return;
    }

    Machine.prototype._moveTo.call(this, x, y, z, speed, wcs, callback);
};

God.prototype._moveAxis = function(startingPos, target, axis, speed, callback){
    if (target == null || target === undefined) {
        callback();
        return;
    }
    this._animateObjects([this.cell], axis, speed, startingPos, target, callback);
};

God.prototype._postPickUpStock = function(exporter, stockPosition, rapidHeight, wcs, safeHeight){
    var data = "";
    data += exporter.moveZ(stockPosition.z-wcs.z);
    return data;
};

God.prototype._postReleaseStock = function(cell, exporter, rapidHeight, wcs, safeHeight){
    var data = "";
    var cellPosition = cell.getPosition();
    data += exporter.rapidXY(cellPosition.x-wcs.x, cellPosition.y-wcs.y);
    data += exporter.addComment("get stock");
    data += exporter.rapidZ(cellPosition.z-wcs.z+safeHeight);
    data += exporter.moveZ(cellPosition.z-wcs.z);
    data += exporter.addComment(JSON.stringify(cell.indices));
    data += exporter.moveZ(cellPosition.z-wcs.z+safeHeight);
    return data;
};


