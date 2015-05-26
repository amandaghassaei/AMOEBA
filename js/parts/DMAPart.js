/**
 * Created by aghassaei on 5/26/15.
 */


var partMaterial = new THREE.MeshLambertMaterial({ color:0xffffff, shading: THREE.FlatShading });
    partMaterial.color.setRGB( 0.9619657144369509, 0.6625466032079207, 0.20799727886007258 );

function DMAPart(index) {
    this.index = index;
    this.mesh = this._buildMesh();
}

DMAPart.prototype._buildMesh = function(){
    var geometry = this._getGeometry();
    var mesh = new THREE.Mesh(geometry, partMaterial);
    mesh.name = "part";
    return mesh;
};

DMAPart.prototype._draw = function(){
    if (this.mesh) console.warn("part mesh already in scene");
    this.mesh = this._makeMeshForType(this.type);
    var rotation = this.parentCell.getEulerRotation();
    this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    this._setMeshPosition(this.parentCell.getPosition());
    globals.three.sceneAdd(this.mesh, "part");
};

DMAPart.prototype.highlight = function(){
//        this.mesh.material.color.setRGB(1,0,0);
};

DMAPart.prototype.unhighlight = function(){
//        if (this.mesh) this.mesh.material.color.setRGB(0.9619657144369509, 0.6625466032079207, 0.20799727886007258);
};

DMAPart.prototype.removeFromCell = function(){//send message back to parent cell to destroy this
    if (this.parentCell) {
        this.parentCell.removePart(this.type);
        globals.three.render();
    } else console.warn("part has no parent cell");
};

DMAPart.prototype.destroy = function(){
    if (this.mesh) {
        globals.three.sceneRemove(this.mesh, "part");
        this.mesh.myPart = null;
//            this.mesh.dispose();
//            geometry.dispose();
//            material.dispose();
        this.mesh = null;
    }
    this.parentCell = null;
    this.type = null;
};

DMAPart.prototype.toJSON = function(){
    return {
    }
};
