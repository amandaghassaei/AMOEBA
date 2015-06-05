/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'globals'],
    function(_, THREE, three, lattice, appState, globals){

    var wireframeMaterial = new THREE.MeshBasicMaterial({color:0x000000, wireframe:true});

    function DMACell(index, superCell){

        if (index) this.index = new THREE.Vector3(index.x, index.y, index.z);
        if (superCell) this.superCell = superCell;
        if (!this.cells) this.material = lattice.get("materialType");

        //object 3d is parent to all 3d elements owned by cell: cell mesh and wireframe, parts, beams, nodes, etc
        this.object3D = this._buildObject3D();
        this.addChildren(this._buildMesh(), this.object3D);//build cell meshes

        if (this.superCell) this.superCell.addChildren(this.object3D);//add as child of supercell

        if (superCell === undefined) {
            if (this.index) {
                three.sceneAdd(this.object3D);
                if (!this.cells) three.addCell(this.object3D.children[0]);//add mesh as highlightable object
            }
            else this.hide();//stock cell
        }

        this.setMode();
    }





    //make 3d stuff

    DMACell.prototype._buildObject3D = function(){
        var object3D = this._translateCell(this._rotateCell(new THREE.Object3D()));
        if (!this.cells) object3D.myParent = this;//reference to get mouse raycasting back, only for lowest level of hierarchy
        object3D.name = "object3D";
        return object3D;
    };

    DMACell.prototype.getObject3D = function(){//careful, used for stock sim only for now  todo need this?
        return this.object3D;
    };

    DMACell.prototype._rotateCell = function(object3D){
        return object3D;//by default, no mesh transformations
    };

    DMACell.prototype._translateCell = function(object3D){
        if (!this.index) return object3D;
        var position = lattice.getPositionForIndex(this.index);
        object3D.position.set(position.x, position.y, position.z);
        return object3D;
    };

    DMACell.prototype._buildMesh = function(){
        var geometry = this._getGeometry();

        var meshes = [];
        var mesh = new THREE.Mesh(geometry, this._getMaterial());
        mesh.name = this._getMeshName();
        meshes.push(mesh);

        var wireframe = this._buildWireframe(mesh, geometry);
        if (!wireframe) return meshes;
        wireframe.name = this._getMeshName();
        meshes.push(wireframe);
        return meshes;
    };

    DMACell.prototype._getMeshName = function(){
        return "cell";
    };

    DMACell.prototype._buildWireframe = function(mesh, geometry){//for "cell" view
        return new THREE.Mesh(geometry, wireframeMaterial);
    };





    //position/index/rotation

    DMACell.prototype.getIndex = function(){
        if (!this.index) {
            console.warn("no index for this cell");
            return null;
        }
        return this.index.clone();
    };

    DMACell.prototype.getAbsoluteIndex = function(){
        if (!this.index) {
            console.warn("no index for this cell");
            return null;
        }
        if (!this.superCell) return this.getIndex();
        return this.superCell.getAbsoluteIndex().add(this.superCell.applyRotation(this.getIndex()));
    };

    DMACell.prototype.getPosition = function(){
        return this.object3D.position.clone();
    };

    DMACell.prototype.getAbsolutePosition = function(){
        if (!this.superCell) return this.getPosition();
        return this.superCell.getAbsolutePosition().add(this.superCell.applyRotation(this.getPosition()));
    };

    DMACell.prototype.getOrientation = function(){
        return this.object3D.quaternion.clone();
    };

    DMACell.prototype.getAbsoluteOrientation = function(){
        if (!this.superCell) return this.getOrientation();
        return this.getOrientation().cross(this.superCell.getAbsoluteOrientation());//order matters!
    };

    DMACell.prototype.getEuler = function(){
        return this.object3D.rotation.clone();
    };

    DMACell.prototype.applyRotation = function(vector){//
        vector.applyQuaternion(this.getOrientation());
    };

    DMACell.prototype.applyAbsoluteRotation = function(vector){
        vector.applyQuaternion(this.getAbsoluteOrientation());
    };







    //children

    DMACell.prototype.addChildren = function(children, object3D){//accepts an array or a single mesh
        this._addRemoveChildren(true, children, object3D);
    };

    DMACell.prototype.removeChildren = function(children, object3D){//accepts an array or a single mesh
        this._addRemoveChildren(false, children, object3D);
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





    //visibility

    DMACell.prototype.hide = function(){
        this.object3D.visible = false;
    };

    DMACell.prototype.show = function(mode){
        this.object3D.visible = true;
        this.setMode(mode);
    };

    DMACell.prototype._getMaterial = function(){
        if (!this.material) console.warn("no material for cell");
        var materialClass = lattice.get("materialClass");
        if (!globals.materials[materialClass]) {
            console.warn("no material class found of type " + materialClass);
            return null;
        }
        var material = globals.materials[materialClass].materials[this.material];
        if (!material){
            console.warn("no material "+ this.material + " found for class "+ materialClass);
            return null;
        }
        return material;
    };

    DMACell.prototype.setOpacity = function(opacity){
    };

    DMACell.prototype.setMode = function(mode){

        if (mode === undefined) mode = appState.get("cellMode");

        switch(mode) {
            case "supercell":
                if (!this.superCell) mode = "cell";//top level item
                break;
            case "cell":
                break;
            case "part":
                if (!this.parts) {
                    this.parts = this._initParts();
                    var self = this;
                    _.each(this.parts, function(part){
                        self.addChildren(part.getMesh());
                    });
                }
                break;
            case "beam":
//                if (!this.beams) this.beams = this._initBeams();
                break;
            case "node":
//                if (!this.nodes) this.nodes = this._initNodes();
                break;
        }

        var visible = !(this.superCell && this.cells);//middle layers are always hidden

        _.each(this.object3D.children, function(child){
            if (child.name == "object3D") return;
            child.visible = visible && (child.name == mode);
        });
    };







    //subcomponents

    DMACell.prototype._initParts = function(){
        return [];//override in subclasses
    };





    //scale

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
        return null;
    };

    DMACell.prototype.xScale = function(){
        return lattice.xScale(0);
    };

    DMACell.prototype.yScale = function(){
        return lattice.yScale(0);
    };

    DMACell.prototype.zScale = function(){
        return lattice.zScale(0);
    };






    //destroy

    DMACell.prototype.destroy = function(){
        if (this.object3D) {
            if (this.superCell) this.superCell.removeChildren(this.object3D);
            else if (this.index) {
                three.sceneRemove(this.object3D);
                if (!this.cells) three.removeCell(this.object3D.children[0]);//remove mesh as highlightable object
            }
            this.object3D.myParent = null;
    //            this.object3D.dispose();
    //            geometry.dispose();
    //            material.dispose();
            this.object3D = null;
        }
        this.destroyParts();
        this.nodes = null;
        this.beams = null;
        this.superCell = null;
        this.material = null;
        this.index = null;
    };

    DMACell.prototype.destroyParts = function(){
        if (!this.parts) return;
        _.each(this.parts, function(part){
            if (part) part.destroy();
        });
        this.parts = null;
    };

    DMACell.prototype.toJSON = function(){
        var data = {
            index:this.index//todo get rid of this and calculate from min and max
        };
        if (this.parts) data.parts = this.parts;
        return data;
    };

    return DMACell;
});



//DMACell.prototype.removePart = function(index){
//    this.parts[index].destroy();
//    this.parts[index] = null;
//    var hasAnyParts = false;//check if all parts have been deleted
//    _.each(this.parts, function(part){
//        if (part) hasAnyParts = true;
//    });
//    if (!hasAnyParts) lattice.removeCell(this);//if all parts are gone, remove cell
//};
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