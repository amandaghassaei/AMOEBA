/**
 * Created by aghassaei on 5/26/15.
 */


var cellBrassMaterial = new THREE.MeshLambertMaterial({color:"#b5a642"});
var cellFiberGlassMaterial = new THREE.MeshLambertMaterial({color:"#fff68f"});

GIKSuperCell = function(length, range, cells){
    if (range) this.indices = _.clone(range.max);
    this.material = globals.lattice.get("materialType");
    this.cells = cells;

    this.object3D = this._buildObject3D();
    this._addChildren(this._buildMesh(length), this.object3D);

    globals.three.sceneAdd(this.object3D, this._getSceneType());

//    this.setMode();

};
GIKSuperCell.prototype = Object.create(DMAParentCell.prototype);

GIKSuperCell.prototype._getSceneType = function(){//todo need this?
    if (this.indices) return "supercell";
    return null;
};

GIKSuperCell.prototype._buildObject3D = function(){
    return this._translateCell(this._rotateCell(new THREE.Object3D()));
};

GIKSuperCell.prototype.addCellsToScene = function(){
    this._addChildren(this._getCellObject3Ds(this.cells));
};

GIKSuperCell.prototype._getCellObject3Ds = function(cells){
    var object3Ds = [];
    var self = this;
    _.each(cells, function(cell){
        var object3D = cell.getObject3D();
        object3Ds.push(object3D);
    });
    return object3Ds;
};

GIKSuperCell.prototype._rotateCell = function(object3D){
    if (this.indices && this.indices.z%2 != 0) object3D.rotateZ(Math.PI/2);
    return object3D;
};

GIKSuperCell.prototype._buildMesh = function(length){
    var meshes = [];
    var superCellGeo = new THREE.BoxGeometry(1,1,1);
    superCellGeo.applyMatrix(new THREE.Matrix4().makeScale(length, 1, 1));
    superCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-length/2+0.5, 0, 0));
    var mesh = new THREE.Mesh(superCellGeo, this.getMaterialType());
    mesh.name = "supercell";
    meshes.push(mesh);
    var wireframe = this._buildWireframe(mesh);
    if (!wireframe) return meshes;
    wireframe.name = "supercell";
    meshes.push(wireframe);
    return meshes;
};

GIKSuperCell.prototype._buildWireframe = function(mesh){
    var wireframe = new THREE.BoxHelper(mesh);
    wireframe.material.color.set(0x000000);
    wireframe.matrixWorld = mesh.matrixWorld;
    wireframe.matrixAutoUpdate = true;
    return wireframe;
};

GIKSuperCell.prototype.getMaterialType = function(){
    var material = cellBrassMaterial;
    if (this.material == "fiberGlass") material = cellFiberGlassMaterial;
    return material;
};

GIKSuperCell.prototype.setMode = function(mode){

    if (mode === undefined) mode = globals.appState.get("cellMode");
    if (mode == "cell") mode = "supercell";
    if (mode == "part") mode = "object3D";

    _.each(this.object3D.children, function(child){
        child.visible = child.name == mode;
    });
};

GIKSuperCell.prototype.getLength = function(){
    return this.cells.length-1;
};

GIKSuperCell.prototype.destroy = function(){
    if (this.destroyStarted) return;//prevents loop destroy from cells
    this.destroyStarted = true;
    globals.three.sceneRemove(this.object3D);
    this.object3D = null;
    _.each(this.cells, function(cell){
        if (cell && !cell.destroyStarted) globals.lattice.removeCell(cell);
    });
    this.cells = null;
    this.indices = null;
    this.material = null;
}