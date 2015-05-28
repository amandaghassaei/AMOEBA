/**
 * Created by aghassaei on 5/28/15.
 */


var assemblerMaterial = new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading, transparent:true, opacity:1});

function Assembler(){

    this.stock = this._buildStock();
    this.object3D = new THREE.Object3D();
    globals.three.sceneAdd(this.object3D);
    var self = this;
    this._buildAssemblerMeshes(function(){
        self._configureAssemblerMovementDependencies();
        globals.three.render();
    });
}

Assembler.prototype._buildStock = function(){
    if (globals.lattice.makeSuperCell) return globals.lattice.makeSuperCell();
    return globals.lattice.makeCellForLatticeType(null);
};

Assembler.prototype._buildAssemblerMeshes = function(callback){
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
        self[name] = new THREE.Mesh(geometry, assemblerMaterial);
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
    globals.three.render();
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
    this.stock.setMode();
};

Assembler.prototype.pickUpStock = function(){
    this.hasStock = true;
    this.cell.draw();
};

Assembler.prototype.releaseStock = function(index){
    this.hasStock = false;
    globals.lattice.showCellAtIndex(JSON.parse(index));
    this.cell.hide();
};

Assembler.prototype.pause = function(){
};







Assembler.prototype.destroy = function(){
    this.stock.destroy();
    this.zAxis.parent.remove(this.zAxis);
    this.xAxis.parent.remove(this.xAxis);
    this.yAxis.parent.remove(this.yAxis);
    this.frame.parent.remove(this.frame);
    this.substrate.parent.remove(this.substrate);
    globals.three.sceneRemove(this.object3D);
    this.stock = null;
    this.zAxis = null;
    this.xAxis = null;
    this.yAxis = null;
    this.frame = null;
    this.substrate = null;
    this.object3D = null;
};
