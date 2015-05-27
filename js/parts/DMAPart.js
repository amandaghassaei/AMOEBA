/**
 * Created by aghassaei on 5/26/15.
 */


var partMaterial = new THREE.MeshLambertMaterial({ color:0xffffff, shading: THREE.FlatShading });
    partMaterial.color.setRGB( 0.9619657144369509, 0.6625466032079207, 0.20799727886007258 );

function DMAPart(index) {
    this.index = index;//todo need this?
    this.mesh = this._buildMesh(index);
}

DMAPart.prototype._buildMesh = function(index){
    var geometry = this._getGeometry(index);
    var mesh = new THREE.Mesh(geometry, partMaterial);
    mesh.name = "part";
    return mesh;
};

DMAPart.prototype.highlight = function(){
//        this.mesh.material.color.setRGB(1,0,0);
};

DMAPart.prototype.unhighlight = function(){
//        if (this.mesh) this.mesh.material.color.setRGB(0.9619657144369509, 0.6625466032079207, 0.20799727886007258);
};

//DMAPart.prototype.removeFromCell = function(){//send message back to parent cell to destroy this
//    if (this.parentCell) {
//        this.parentCell.removePart(this.index);
//        globals.three.render();
//    } else console.warn("part has no parent cell");
//};

DMAPart.prototype.getMesh = function(){//only call by parent cell
    return this.mesh;
};

DMAPart.prototype.destroy = function(){
    if (this.mesh) {
        this.mesh.parent.remove(this.mesh);
        this.mesh = null;
    }
    this.index = null;
};

DMAPart.prototype.toJSON = function(){
    return {
    }
};
