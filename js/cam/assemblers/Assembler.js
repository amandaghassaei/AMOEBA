/**
 * Created by aghassaei on 5/28/15.
 */


var assemblerMaterial = new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading, transparent:true, opacity:1});

function Assembler(){

    this.stock = this._buildStock();
    this.object3D = new THREE.Object3D();
    globals.three.sceneAdd(this.object3D);
    var self = this;
    this._loadStls(function(){
        self._configureAssemblerMovementDependencies();
    });
}

Assembler.prototype._buildStock = function(){
    if (globals.lattice.makeSuperCell) return globals.lattice.makeSuperCell();
    return globals.lattice.makeCellForLatticeType(null);
};

Assembler.prototype._loadStls = function(callback){
    callback();
};

Assembler.prototype._configureAssemblerMovementDependencies = function(){
};

Assembler.prototype.setVisibility = function(visible){
    this.object3D.visible = visible;
    globals.three.render();
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
