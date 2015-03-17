/**
 * Created by fab on 3/16/15.
 */


function Machine() {

    this.cell = new DMARotatedEdgeCell(null);
    this.setVisibility(false);

}

Machine.prototype.setVisibility = function(visible){
    if (visible){
        this.cell.draw();
    } else {
        this.cell.hide();
    }
};

Machine.prototype.updatePartType = function(){
    this.cell.destroyParts();
    this.cell.draw();
};






Machine.prototype.pause = function(){
};

Machine.prototype.moveTo = function(x, y, z, speed, wcs, callback){
    var self = this;
    setTimeout( function() {
        //reaching a little deep here, might want to find a better solution
        if (x != "") self.cell.cellMesh.position.x = parseFloat(x)+wcs.x;
        if (y != "") self.cell.cellMesh.position.y = parseFloat(y)+wcs.y;
        if (z != "") self.cell.cellMesh.position.z = parseFloat(z)+wcs.z;
        self.cell.updateForScale();
        dmaGlobals.three.render();
        return callback();
    }, 500/dmaGlobals.assembler.get("simSpeed"));

};