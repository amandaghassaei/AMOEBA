/**
 * Created by aghassaei on 5/26/15.
 */


var cellMaterial = new THREE.MeshNormalMaterial();
var wireframeMaterial = new THREE.MeshBasicMaterial({color:0x000000, wireframe:true});

function DMACell(indices){

    this.indices = indices;

    //object 3d is parent to all 3d elements related to cell, parts, beams, nodes, etc
    this.object3D = this._buildObject3D();
    this._addChildren(this._buildMesh(), this.object3D);//build cell meshes
    if (!this.superCell){
        if (this.indices) globals.three.sceneAdd(this.object3D, "cell");
        else this.hide();
    }

    this.setMode();
}

DMACell.prototype._buildObject3D = function(){
    var object3D = this._translateCell(this._rotateCell(new THREE.Object3D()));
    object3D.myParent = this;//reference to get mouse raycasting back
    object3D.name = "object3D";
    return object3D;
};

DMACell.prototype.getObject3D = function(){//careful, used for stock sim only for now
    return this.object3D;
};







DMACell.prototype._rotateCell = function(object3D){
    return object3D;//by default, no mesh transformations
};

DMACell.prototype._translateCell = function(object3D){
    if (!this.indices) return object3D;
    var position = globals.lattice.getPositionForIndex(this.indices);
    object3D.position.set(position.x, position.y, position.z);
    return object3D;
};

DMACell.prototype._buildMesh = function(){
    var geometry = this._getGeometry();
    var meshes = [];
    var mesh = new THREE.Mesh(geometry, this.getMaterial());
    mesh.name = "cell";
    meshes.push(mesh);
    var wireframe = this._buildWireframe(mesh, geometry);
    if (!wireframe) return meshes;
    wireframe.name = "cell";
    meshes.push(wireframe);
    return meshes;
};

DMACell.prototype._buildWireframe = function(mesh, geometry){//abstract mesh representation of cell
    return new THREE.Mesh(geometry, wireframeMaterial);
};

DMACell.prototype._addChildren = function(children, object3D){//accepts an array or a single mesh
    this._addRemoveChildren(true, children, object3D);
};

DMACell.prototype._removeChildren = function(children, object3D){//accepts an array or a single mesh
    this._addRemoveMeshes(false, children, object3D);
};

DMACell.prototype._addRemoveChildren = function(shouldAdd, children, object3D){//accepts an array or a single mesh
    if (object3D === undefined) object3D = this.object3D;
    if (children.constructor === Array){
        _.each(children, function(child){
            if (shouldAdd) object3D.add(child);
            else object3D.remove(child);
        });
    } else if (shouldAdd) object3D.add(children);
    else object3D.remove(children);
};

DMACell.prototype.hide = function(){
    this.object3D.visible = false;
};

DMACell.prototype.show = function(mode){
    this.object3D.visible = true;
    this.setMode(mode);
};

DMACell.prototype.getMaterial = function(){
    return cellMaterial;
};

DMACell.prototype.setOpacity = function(opacity){
};






DMACell.prototype._initParts = function(){
    return [];//override in subclasses
};

DMACell.prototype.setSuperCell = function(superCell, index){//todo get rid of this
    this.superCell = superCell;
    this.superCellIndex = index;

    if (this.superCellIndex == this.superCell.getLength()) this.mesh.rotateZ(Math.PI);
    if (globals.appState.get("cellMode")=="part") {
        this.parts = this._initParts();
        this.draw();
    }
};

DMACell.prototype.setMode = function(mode){

    if (mode === undefined) mode = globals.appState.get("cellMode");
    if (this.superCell) this.superCell.setMode(mode);

    switch(mode) {
        case "cell":
            break;
        case "part":
            if (!this.parts) {
                this.parts = this._initParts();
                var self = this;
                _.each(this.parts, function(part){
                    self._addChildren(part.getMesh());
                });
            }
            break;
        case "beam":
            if (!this.beams) this.beams = this._initBeams();
            break;
        case "node":
            if (!this.nodes) this.nodes = this._initNodes();
            break;
    }

    _.each(this.object3D.children, function(child){
        child.visible = child.name == mode;
    });
};

DMACell.prototype.getPosition = function(){
    if (this.superCell && this.indices) return globals.lattice.getPositionForIndex(this.indices);
    return this.object3D.position.clone();
};

DMACell.prototype.getQuaternion = function(){
    return this.object3D.quaternion.clone();
};

DMACell.prototype.getEuler = function(){
    return this.object3D.rotation.clone();
};

DMACell.prototype.axisScale = function(axis){
    switch (axis){
        case "x":
            return this.xScale();
        case "y":
            return this.yScale();
        case "z":
            return this.zScale();
        default:
            console.warn(axis + " axis not recognized");
            break;
    }
};

DMACell.prototype.xScale = function(){
    return globals.lattice.xScale(0);
};

DMACell.prototype.yScale = function(){
    return globals.lattice.yScale(0);
};

DMACell.prototype.zScale = function(){
    return globals.lattice.zScale(0);
};

DMACell.prototype.destroy = function(){
    if (this.destroyStarted) return;
    this.destroyStarted = true;
    if (this.object3D) {
        if (this.superCell) this.object3D.parent.remove(this.object3D);
        if (this.indices) globals.three.sceneRemove(this.object3D, "cell");
        this.object3D.myParent = null;
//            this.object3D.dispose();
//            geometry.dispose();
//            material.dispose();
        this.object3D = null;
    }
    this.destroyParts();
    this.nodes = null;
    this.beams = null;
    if (this.superCell) {
        this.superCell.destroy();
        this.superCell = null;
    }
    this.superCellIndex = null;
    this.indices = null;
};

DMACell.prototype.destroyParts = function(){
    _.each(this.parts, function(part){
        if (part) part.destroy();
    });
    this.parts = null;
};

//DMACell.prototype.removePart = function(index){
//    this.parts[index].destroy();
//    this.parts[index] = null;
//    var hasAnyParts = false;//check if all parts have been deleted
//    _.each(this.parts, function(part){
//        if (part) hasAnyParts = true;
//    });
//    if (!hasAnyParts) globals.lattice.removeCell(this);//if all parts are gone, remove cell
//};

DMACell.prototype.toJSON = function(){
    var data = {
        indices:this.indices//todo get rid of this and calculate from min and max
    };
    if (this.parts) data.parts = this.parts;
    return data;
};



//DMACell.prototype.moveTo = function(position, axis){//used for stock simulations
//    this.object3D.position[axis] = position;
//    if (globals.appState.get("cellMode") == "part"){
//        _.each(this.parts, function(part){
//            if (part) part.moveTo(position, axis);
//        });
//    }
//};
//
//DMACell.prototype.getType = function(){
//    return null;//only used in freeform layout
//};
//
//DMACell.prototype._initNodes = function(vertices){
//    var position = this.getPosition();
//    var orientation = this.getOrientation();
//    var nodes = [];
//    for (var i=0;i<vertices.length;i++){
//        var vertex = vertices[i].clone();
//        vertex.applyQuaternion(orientation);
//        vertex.add(position);
//        nodes.push(new DmaNode(vertex, i));
//    }
//    return nodes;
//};
//
//
//DMACell.prototype._initBeams = function(nodes, faces){
//    var beams = [];
//    var self = this;
//    var addBeamFunc = function(index1, index2){
//        var duplicate = false;
//        _.each(beams, function(beam){
//            var index = beam.getIndex();
//            if (index[0] == index1 && index[1] == index2) duplicate = true;
//        });
//        if (duplicate) return;
//        var diff = nodes[index1].getPosition();
//        diff.sub(nodes[index2].getPosition());
//        if (diff.length() > self.getScale()*1.01) return;
//        if (index2>index1) {
//            beams.push(new DmaBeam(nodes[index1], nodes[index2], self));
//        }
//    };
//    for (var i=0;i<nodes.length;i++){
//        _.each(faces, function(face){
//            if (face.a == i) {
//                addBeamFunc(i, face.b);
//                addBeamFunc(i, face.c);
//            } else if (face.b == i){
//                addBeamFunc(i, face.a);
//                addBeamFunc(i, face.c);
//            } else if (face.c == i){
//                addBeamFunc(i, face.a);
//                addBeamFunc(i, face.b);
//            }
//        })
//    }
//    return beams;
//};