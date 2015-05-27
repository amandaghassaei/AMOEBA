/**
 * Created by aghassaei on 5/27/15.
 */


//common methods between cell and supercell classes

function DMAParentCell(){
}

DMAParentCell.prototype._rotateCell = function(object3D){
    return object3D;//by default, no mesh transformations
};

DMAParentCell.prototype._translateCell = function(object3D){
    var position = globals.lattice.getPositionForIndex(this.indices);
    object3D.position.set(position.x, position.y, position.z);
    return object3D;
};

DMAParentCell.prototype._addMeshes = function(meshes, object3D){//accepts an array or a single mesh
    this._addRemoveMeshes(true, meshes, object3D);
};

DMAParentCell.prototype._removeMeshes = function(meshes, object3D){//accepts an array or a single mesh
    this._addRemoveMeshes(false, meshes, object3D);
};

DMAParentCell.prototype._addRemoveMeshes = function(shouldAdd, meshes, object3D){//accepts an array or a single mesh
    if (object3D === undefined) object3D = this.object3D;
    if (meshes.constructor === Array){
        _.each(meshes, function(mesh){
            if (shouldAdd) object3D.add(mesh);
            else object3D.remove(mesh);
        });
    } else if (shouldAdd) object3D.add(meshes);
    else object3D.remove(meshes);
};

DMAParentCell.prototype.hide = function(){
    this.object3D.visible = false;
};

DMAParentCell.prototype.show = function(mode){
    this.object3D.visible = true;
    this.setMode(mode);
};

DMAParentCell.prototype.setOpacity = function(opacity){
};

DMAParentCell.prototype.getPosition = function(){
    return this.object3D.position.clone();
};

DMAParentCell.prototype.getQuaternion = function(){
    return this.object3D.quaternion.clone();
};

DMAParentCell.prototype.getEuler = function(){
    return this.object3D.rotation.clone();
};