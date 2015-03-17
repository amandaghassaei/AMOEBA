/**
 * Created by fab on 3/16/15.
 */


function Machine() {

    this.hasStock = false;

    //load end effector geo
    var loader = new THREE.STLLoader();
    var self = this;
    loader.load("data/shopbotEndEffector.stl", function(geometry){

        geometry.computeBoundingBox();
        var unitScale = 1.5/geometry.boundingBox.max.y;
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0, Math.sqrt(2)/2));
        var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading}));
        self.endEffector = mesh;
        dmaGlobals.three.sceneAdd(mesh);
        mesh.visible = false;
    });

    this.cell = new DMARotatedEdgeCell(null);
    this.setVisibility(false);

}

Machine.prototype.setVisibility = function(visible){
    if (visible){
        if (this.hasStock) this.cell.draw();
        if (this.endEffector) this.endEffector.visible = true;
    } else {
        this.cell.hide();
        if (this.endEffector) this.endEffector.visible = false;
    }
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

Machine.prototype.moveTo = function(x, y, z, speed, wcs, callback){
    var self = this;
    setTimeout( function() {
        //reaching a little deep here, might want to find a better solution
        if (x != "") {
            var nextX = parseFloat(x)+wcs.x;
            self.endEffector.position.x = nextX;
            self.cell.cellMesh.position.x = nextX;
        }
        if (y != "") {
            var nextY = parseFloat(y)+wcs.y;
            self.endEffector.position.y = nextY;
            self.cell.cellMesh.position.y = nextY;
        }
        if (z != "") {
            var nextZ = parseFloat(z)+wcs.z;
            self.endEffector.position.z = nextZ;
            self.cell.cellMesh.position.z = nextZ;
        }
        self.cell.updateForScale();
        dmaGlobals.three.render();
        return callback();
    }, 500/dmaGlobals.assembler.get("simSpeed"));

};