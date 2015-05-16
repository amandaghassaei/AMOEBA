/**
 * Created by aghassaei on 5/15/15.
 */


var cellMaterials = [new THREE.MeshNormalMaterial()];

DMASuperCell = function(length, range, cells){
    var shouldRotate = range.max.x == range.min.x;
    this.mesh = this._buildSuperCellMesh(length, shouldRotate);
    this.setVisibility(dmaGlobals.appState.get("cellMode")=="cell");
    this.index = _.clone(range.max);
    this.cells = cells;
    this.setScale();
    dmaGlobals.three.sceneAdd(this.mesh);
};

DMASuperCell.prototype._buildSuperCellMesh = function(length, shouldRotate){
    var superCellGeo = new THREE.BoxGeometry(1,1,1);
    superCellGeo.applyMatrix(new THREE.Matrix4().makeScale(length, 1, 1));
    superCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-(length/2-1/2), 0, 0));
    if (shouldRotate) superCellGeo.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/2));
    var mesh = THREE.SceneUtils.createMultiMaterialObject(superCellGeo, cellMaterials);
    var wireframe = new THREE.BoxHelper(mesh.children[0]);
    wireframe.material.color.set(0x000000);
    mesh.children.push(wireframe);
    return mesh;
};

DMASuperCell.prototype._setPosition = function(index){
    var position = dmaGlobals.lattice.getPositionForIndex(index);
    this.mesh.position.set(position.x, position.y, position.z);
};

DMASuperCell.prototype.setScale = function(scale){
    if (!scale) scale = dmaGlobals.lattice.get("scale");
    this.mesh.scale.set(scale, scale, scale);
    this._setPosition(this.index);
};

DMASuperCell.prototype.setVisibility = function(visible){
    this.mesh.visible = visible;
};

DMASuperCell.prototype.getLength = function(){
    return this.cells.length-1;
};

DMASuperCell.prototype.destroy = function(){
    if (this.destroyStarted) return;//prevents loop destroy from cells
    this.destroyStarted = true;
    dmaGlobals.three.sceneRemove(this.mesh);
    _.each(this.cells, function(cell){
        if (cell && !cell.destroyStarted) dmaGlobals.lattice.removeCell(cell);
    });
    this.cells = null;
    this.mesh = null;
    this.index = null;
}