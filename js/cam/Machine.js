/**
 * Created by fab on 3/16/15.
 */


function Machine() {

    this.hasStock = false;

    this.meshes = [];
    var self = this;
    this._buildMeshes(function(meshes){
        self.meshes = meshes;
        _.each(meshes, function(mesh){
            dmaGlobals.three.sceneAdd(mesh);
        });
    });
    this.cell = this._makeStockCell();
    this.setVisibility(false);
}

Machine.prototype.setVisibility = function(visible){
    if (visible == null || visible === undefined) visible = dmaGlobals.assembler.isVisible();
    if (visible && this.hasStock) this.cell.draw();
    else this.cell.hide();
    this._setMeshesVisiblity(visible);
};

Machine.prototype._setMeshesVisiblity = function(visible){
    _.each(this.meshes, function(mesh){
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
        _.each(objects, function(object){
            if (object instanceof DMACell) object.moveTo(nextPos, axis);
            else object.position[axis] = nextPos;
        });
        self._incrementalMove(objects, axis, increment, nextPos, target, direction, callback, simSpeed)
    },simSpeed);
};

Machine.prototype.destroy = function(){
    this.cell.destroy();
    _.each(this.meshes, function(mesh){
        dmaGlobals.three.sceneRemove(mesh);
        mesh = null;
    });
    this.meshes = null;
};



///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////SHOPBOT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function Shopbot(){
    Machine.call(this);
}
Shopbot.prototype = Object.create(Machine.prototype);

Shopbot.prototype._buildMeshes = function(callback){
    var meshes = [];
    (new THREE.STLLoader()).load("data/shopbotEndEffector.stl", function(geometry){
        geometry.computeBoundingBox();
        var unitScale = 1.5/geometry.boundingBox.max.y;
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0, Math.sqrt(2)/2));
        var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading}));
        mesh.visible = false;
        meshes.push(mesh);
        callback(meshes);
    });
};

Shopbot.prototype._moveTo = function(x, y, z, speed, wcs, callback){
    var totalThreads = 3;
    function sketchyCallback(){
        totalThreads -= 1;
        if (totalThreads > 0) return;
        callback();
    }
    speed = this._normalizeSpeed(this.meshes[0].position, x, y, this._reorganizeSpeed(speed));
    this._moveAxis(x, "x", speed.x, sketchyCallback);
    this._moveAxis(y, "y", speed.y, sketchyCallback);
    this._moveAxis(z, "z", speed.z, sketchyCallback);
    this.cell.updateForScale();//todo why is this here?
};

Shopbot.prototype._moveAxis = function(target, axis, speed, callback){
    if (target == null || target === undefined) {
        callback();
        return;
    }
    this._animateObjects(this.meshes.concat(this.cell), axis, speed, this.meshes[0].position[axis], target, callback);
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////ONE BIT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function OneBitBot(){
    Machine.call(this);
}
OneBitBot.prototype = Object.create(Machine.prototype);