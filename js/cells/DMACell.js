/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'globals', 'materials'],
    function(_, THREE, three, lattice, appState, globals, materials){

    var wireframeMaterial = new THREE.MeshBasicMaterial({color:0x000000, wireframe:true});

    function DMACell(json, superCell){

        if (json.index) this.index = new THREE.Vector3(json.index.x, json.index.y, json.index.z);
        if (superCell) this.superCell = superCell;
        this.materialName = json.materialName || appState.get("materialType");

        //object 3d is parent to all 3d elements owned by cell: cell mesh and wireframe, parts, beams, nodes, etc
        this.object3D = this._buildObject3D();
        this.addChildren(this._buildMesh(), this.object3D);//build cell meshes

        if (this.superCell) this.superCell.addChildren(this.object3D);//add as child of supercell

        if (this.index){
            if (!this.cells) lattice.getUItarget().addHighlightableCell(this.object3D.children[0]);//add mesh as highlightable object, only for lowest level of hierarchy
            if (!superCell || superCell === undefined) three.sceneAdd(this.object3D);//add object3d as child of scene if top level of hierarchy
        } else this.hide();//stock cell

        if (!this.cells) this.setMode();
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
        var mesh = new THREE.Mesh(geometry, this.getMaterial(true));
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

    DMACell.prototype._buildWireframe = function(mesh, geometry, isBeam){//for "cell" view
        if (isBeam) new THREE.Mesh(geometry, wireframeMaterial.clone());//todo fix this
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
        return this.getOrientation().multiply(this.superCell.getAbsoluteOrientation());//order matters!
    };

    DMACell.prototype.applyRotation = function(vector){//todo local rotation?
        vector.applyQuaternion(this.getAbsoluteOrientation());
        return vector;
    };

    DMACell.prototype.applyAbsoluteRotation = function(vector){
        vector.applyQuaternion(this.getAbsoluteOrientation());
        return vector;
    };







    //highlighting

    DMACell.prototype.calcHighlighterParams = function(face, point){//this works for rectalinear, override in subclasses
        var direction = this.applyAbsoluteRotation(face.normal.clone());//todo local orientation?
        var position = this.getAbsolutePosition();
        var self  = this;
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*self.axisScale(key)/2;
        });
        return {direction:direction, position:position};
    };

    DMACell.prototype.setDeleteMode = function(state){
        var material;
        if (!state && !this.materialName) return;//cell may be deleted by now
        if (state) material = materials.list.deleteMaterial.threeMaterial;
        else  material = this.getMaterial(true);
        if (!material) return;//no material object found
        if (this.object3D.children[0].material == material) return;

        if (this.cells){
            this._loopCells(function(cell){
                if (cell) cell.setDeleteMode(state);
            });
        }
        if (this.parts){
            _.each(this.parts, function(part){
                if (part) part.setMaterial(material);
            });
        }
        this.object3D.children[0].material = material;
        three.render();
    };

    DMACell.prototype.getParent = function(){
        if (this.superCell) return this.superCell.getParent();
        return this;
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

    DMACell.prototype.getMaterial = function(returnTHREEObject){
        if (!this.materialName) {
            console.warn("no material type set for cell");
            return null;
        }
        if (!returnTHREEObject) return materials.list[this.materialName];
        if (!materials.list[this.materialName]) {
            console.warn("no material object found of type " + this.materialName);
            return null;
        }
        if (!materials.list[this.materialName].threeMaterial){
            console.warn("no three material object found for type "+ this.materialName);
            return null;
        }
        return materials.list[this.materialName].threeMaterial;
    };

    DMACell.prototype.setOpacity = function(opacity){
    };

    DMACell.prototype.setMode = function(mode, callback){

        if (!mode || mode === undefined) mode = appState.get("cellMode");
        var self = this;

        switch(mode) {
            case "supercell":
                if (this._isTopLayerCell()) mode = "cell";//top level item
                setVisiblity();
                break;
            case "cell":
                setVisiblity();
                break;
            case "part":
                if (!this.cells && !this.parts) {
                    this._initParts(function(parts){
                        self.parts = parts;
                        setVisiblity();
                    });
                } else setVisiblity();
                break;
            case "beam":
                if (!this.cells && !this.beams) this.beams = this._initBeams(function(){
                    if (!this.nodes) this.nodes = self._initNodes(function(){
                        setVisiblity();
                    });
                    else setVisiblity();
                });
                else setVisiblity();
                break;
            case "node":
//                if (!this.nodes) this.nodes = this._initNodes();
                setVisiblity();
                break;
            default:
                break;
        }

        function setVisiblity(){
            var visible = true;
            if (mode == "supercell") visible = !self._isMiddleLayer();//middle layers are always hidden in supercell mode

            _.each(self.object3D.children, function(child){
                if (child.name == "object3D") return;
                child.visible = visible && (child.name == mode);
            });
            if (callback) {
                callback();
                return;
            }

            if (!self.superCell) three.conditionalRender();
        }
    };

    DMACell.prototype._isMiddleLayer = function(){
        return false;
    };

    DMACell.prototype._isTopLayerCell = function(){
        return this.superCell === null || this.superCell === undefined;
    };








    //subcomponents

    DMACell.prototype._initParts = function(callback){
        if (callback) callback();//override in subclasses
        return [];
    };

    DMACell.prototype._initNodes = function(callback){
//        var PI2 = Math.PI * 2;
//        var material = new THREE.SpriteCanvasMaterial({
//            color: 0xffffff,
//            program: function ( context ) {
//                context.beginPath();
//                context.arc( 0, 0, 2, 0, PI2, true );
//                context.fill();
//             }
//        });
//
//        var particle = new THREE.Sprite(material);
//        particle.name = "beam";
//        this.addChildren(particle);
        if (callback) callback();
        return true;
    };

    DMACell.prototype._initBeams = function(callback){
        var wireframe = this._buildWireframe(this.object3D.children[0], this._getGeometry(), true);
        wireframe.name = "beam";
        if (wireframe.material.wireframeLinewidth) wireframe.material.wireframeLinewidth = 5;
        else wireframe.material.linewidth = 5;
        wireframe.material.color = this.getMaterial(true).color;
        this.addChildren(wireframe);
        if (callback) callback();
        return true;
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





    //parse
    DMACell.prototype.addToDenseArray = function(cellsArray, min){
        var index = this.getAbsoluteIndex().sub(min);
        cellsArray[index.x][index.y][index.z] = this;
    };





    //destroy

    DMACell.prototype.destroy = function(){//todo remove reference from lattice.cells
        this.destroyParts();
        if (this.object3D) {
            if (this.superCell) this.superCell.removeChildren(this.object3D);
            else if (this.index) three.sceneRemove(this.object3D);
            if (!this.cells) lattice.getUItarget().removeHighlightableCell(this.object3D.children[0]);//remove mesh as highlightable object
            this.object3D.myParent = null;
    //            this.object3D.dispose();
    //            geometry.dispose();
    //            material.dispose();
            this.object3D = null;
        }
        this.nodes = null;
        this.beams = null;
        this.superCell = null;
        this.materialName = null;
        this.index = null;
        this.length = null;
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
            materialName: this.materialName
        };
//        if (materials.list[this.materialName].sparseCells) return data;//material definition in material composites
//        if (this.cells) data.cells = this.cells;
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