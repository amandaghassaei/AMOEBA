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

Machine.prototype._animateMesh = function(mesh, axis, speed, target, callback){
    var increment = 0.1/speed;//based on 1/10th of sec
    if (increment == 0) {
        if (callback) callback();
        return;
    }
    var direction = 1;
    if (increment<0) direction = -1;
    increment = Math.max(Math.abs(increment), 0.00001)*direction;//need to put a min on the increment - other wise this stall out with floating pt tol
    dmaGlobals.three.startAnimationLoop();
    var simSpeed = 100/dmaGlobals.assembler.get("simSpeed");//1/10th of sec
    this._incrementalMove(mesh, axis, increment, target, direction, callback, simSpeed);
};

Machine.prototype._incrementalMove = function(mesh, axis, increment, target, direction, callback, simSpeed){
    var self = this;
    setTimeout(function(){
        if ((target-mesh.position[axis])*direction <= 0) {
            if (callback) callback();
            return;
        }
        if (Math.abs(target-mesh.position[axis]) < Math.abs(increment)) mesh.position[axis] = target;//don't overshoot
        else mesh.position[axis] += increment;
        self._incrementalMove(mesh, axis, increment, target, direction, callback, simSpeed)
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

Shopbot.prototype.moveTo = function(x, y, z, speed, wcs, callback){
    var endEffector = this.meshes[0];
    var totalThreads = 3;
    function sketchyCallback(){
        totalThreads -= 1;
        if (totalThreads > 0) return;
        callback();
    }
    this._moveAxis(endEffector, x, "x", speed.xy, wcs, sketchyCallback);
    this._moveAxis(endEffector, y, "y", speed.xy, wcs, sketchyCallback);
    this._moveAxis(endEffector, z, "z", speed.z, wcs, sketchyCallback);
    this.cell.updateForScale();//todo why is this here?
};

Shopbot.prototype._moveAxis = function(mesh, target, axis, speed, wcs, callback){
    if (target != "") {
        target = parseFloat(target)+wcs[axis];
        this._animateMesh(mesh, axis, speed, target, callback);
        this._animateMesh(this.cell.cellMesh, axis, speed, target, null);//todo reaching a little deep here, might want to find a better solution
    } else callback();
};



///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////ONE BIT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function OneBitBot(){
    Machine.call(this);
}
OneBitBot.prototype = Object.create(Machine.prototype);