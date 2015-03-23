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
};

Machine.prototype.updatePartType = function(){
    this.cell.destroyParts();
    this.cell.draw();
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
    var self = this;
    var endEffector = this.meshes[0];
    setTimeout( function() {
        //reaching a little deep here, might want to find a better solution
        if (x != "") {
            var nextX = parseFloat(x)+wcs.x;
            endEffector.position.x = nextX;
            self.cell.cellMesh.position.x = nextX;
        }
        if (y != "") {
            var nextY = parseFloat(y)+wcs.y;
            endEffector.position.y = nextY;
            self.cell.cellMesh.position.y = nextY;
        }
        if (z != "") {
            var nextZ = parseFloat(z)+wcs.z;
            endEffector.position.z = nextZ;
            self.cell.cellMesh.position.z = nextZ;
        }
        self.cell.updateForScale();
        dmaGlobals.three.render();
        return callback();
    }, 500/dmaGlobals.assembler.get("simSpeed"));

};



///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////ONE BIT///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function OneBitBot(){
    Machine.call(this);
}
OneBitBot.prototype = Object.create(Machine.prototype);