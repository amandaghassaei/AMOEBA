/**
 * Created by aghassaei on 6/1/15.
 */


DMASuperCell = function(index, superCell){//supercells might have supercells

    this.material = globals.lattice.get("materialType");//todo move to dmacell
    DMACell.call(this, index, superCell);
    var range = globals.lattice.get("superCellRange");
    this.cells = this._makeChildCells(index, range);//todo three dimensional array?

    var self = this;
    _.each(this.cells, function(cell){
        self._addChildren(cell.getObject3D());
    });

    this.setMode();
};
DMASuperCell.prototype = Object.create(DMACell.prototype);

DMASuperCell.prototype._makeChildCells = function(index, range){
    var cells = [];
    for (var x=0;x<range.x;x++){
        for (var y=0;y<range.y;y++){
            for (var z=0;z<range.z;z++){
                cells.push(this._makeSubCellForIndex({x:x, y:y, z:z}));
            }
        }
    }
    return cells;
};

DMASuperCell.prototype._makeSubCellForIndex = function(index){
    return null;//override in subclasses
};

DMASuperCell.prototype._getModeName = function(){
    return "";
};

DMASuperCell.prototype._getSceneName = function(){
    return "supercell";
};

DMASuperCell.prototype.setMode = function(mode){

    if (mode === undefined) mode = globals.appState.get("cellMode");

    _.each(this.cells, function(cell){
        cell.setMode(mode);
    });

    if (mode == "cell") mode = "supercell";
    if (mode == "part") mode = "object3D";

    _.each(this.object3D.children, function(child){
        child.visible = child.name == mode;
    });
};

DMASuperCell.prototype.getLength = function(){
    if (this.cells) return this.cells.length-1;
    return globals.lattice.get("superCellRange").x-1;
};

DMASuperCell.prototype.destroy = function(){
    this.object3D.myParent = null;
    globals.three.sceneRemove(this.object3D, this._getSceneName());
    this.object3D = null;
    _.each(this.cells, function(cell){
        if (cell) cell.destroy();
    });
    this.cells = null;
    this.index = null;
    this.material = null;
};