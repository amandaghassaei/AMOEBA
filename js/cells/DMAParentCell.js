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

DMAParentCell.prototype._addChildren = function(children, object3D){//accepts an array or a single mesh
    this._addRemoveChildren(true, children, object3D);
};

DMAParentCell.prototype._removeChildren = function(children, object3D){//accepts an array or a single mesh
    this._addRemoveMeshes(false, children, object3D);
};

DMAParentCell.prototype._addRemoveChildren = function(shouldAdd, children, object3D){//accepts an array or a single mesh
    if (object3D === undefined) object3D = this.object3D;
    if (children.constructor === Array){
        _.each(children, function(child){
            if (shouldAdd) object3D.add(child);
            else object3D.remove(child);
        });
    } else if (shouldAdd) object3D.add(children);
    else object3D.remove(children);
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