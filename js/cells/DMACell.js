/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'globals', 'materials'],
    function(_, THREE, three, lattice, appState, globals, materials){

    var wireframeMaterial = new THREE.MeshBasicMaterial({color:0x000000, wireframe:true});

    function DMACell(json, superCell){

        if (json.index) this.index = new THREE.Vector3(json.index.x, json.index.y, json.index.z);
        if (superCell) this.superCell = superCell;
        this.material = materials.getMaterialForId(json.materialID || appState.get("materialType"));
        this.isTransparent = false;

        //object 3d is parent to all 3d elements owned by cell: cell mesh and wireframe, parts, beams, nodes, etc
        this.object3D = this._buildObject3D();
        this.addChildren(this._buildMesh(), this.object3D);//build cell meshes

        if (this.superCell) this.superCell.addChildren(this.object3D);//add as child of supercell
        if (!this.sparseCells) this.setMode();
    }

    DMACell.prototype.addToScene = function(superCell){
        if (!this.sparseCells) lattice.getUItarget().addHighlightableCell(this.getHighlightableMesh());//add mesh as highlightable object, only for lowest level of hierarchy
        if (!superCell || superCell === undefined) three.sceneAdd(this.object3D);//add object3d as child of scene if top level of hierarchy
        if (this.sparseCells){
            var self = this;
            this._loopCells(function(cell){
                cell.addToScene(self);
            });
        }
    };


    //make 3d stuff

    DMACell.prototype._buildObject3D = function() {
        var object3D = this._translateCell(this._rotateCell(new THREE.Object3D()));
        if (this._isBottomLayer()) object3D.myParent = this;//reference to get mouse raycasting back, only for lowest level of hierarchy
        object3D.name = "object3D";
        return object3D;
    };

    DMACell.prototype.getHighlightableMesh = function(){
        return this.object3D.children[0];
    };

    DMACell.prototype._rotateCell = function(object3D){
        return object3D;//by default, no mesh transformations
    };

    DMACell.prototype._translateCell = function(object3D){
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
        if (this._isBottomLayer()) return "cell";
        return "supercell";
    };

    DMACell.prototype._buildWireframe = function(mesh, geometry){//for "cell" view
        return new THREE.Mesh(geometry, wireframeMaterial);
    };





    //position/index/rotation

    DMACell.prototype.getIndex = function(){
        return this.index.clone();
    };

    DMACell.prototype.getAbsoluteIndex = function(){
        if (!this.superCell) return this.getIndex();
        var superCellIndex = this.superCell.getAbsoluteIndex();
        return superCellIndex.add(this.superCell.applyRotation(this.getIndex()).round());
    };

    DMACell.prototype.getDimensions = function(){
        return new THREE.Vector3(1,1,1);
    };

    DMACell.prototype.getAbsoluteDimensions = function(){
        return this.getDimensions();
    };

    DMACell.prototype.getBounds = function(){//todo need to account for origin eventually
        var index = this.getIndex();
        return {min: index, max: index};
    };

    DMACell.prototype.getAbsoluteBounds = function(){
        var index = this.getAbsoluteIndex();
        return {min: index, max: index};
    };

    DMACell.prototype.getLatticeIndex = function(){
        var parent = lattice.getUItarget();//todo no
        return this.getAbsoluteIndex().sub(parent.get("cellsMin"));
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
        vector.applyQuaternion(this.getOrientation());
        return vector;
    };

    DMACell.prototype.applyAbsoluteRotation = function(vector){
        vector.applyQuaternion(this.getAbsoluteOrientation());
        return vector;
    };







    //highlighting

    DMACell.prototype.calcHighlighterParams = function(face, point){//this works for cells where addition happens orthogonal to all faces
        var direction = this.applyAbsoluteRotation(face.normal.clone());//todo local orientation?
        var position = this.getAbsolutePosition();
        position.add(direction.clone().multiply(this.aspectRatio().divideScalar(2)));
        return {direction:direction, position:position};
    };

    DMACell.prototype.setDeleteMode = function(state){
        var threeMaterial;
        if (!state && !this.material) return;//cell may be deleted by now
        if (state) threeMaterial = materials.getDeleteMaterial();
        else  threeMaterial = this.getMaterial(true);
        if (!threeMaterial) return;//no material object found

        if (this.sparseCells){
            this._loopCells(function(cell){
                if (cell) cell.setDeleteMode(state);
            });
        }
        if (this.parts){
            _.each(this.parts, function(part){
                if (part) part.setMaterial(threeMaterial);
            });
        }
        this._setTHREEMaterial(threeMaterial);
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
        else object3D.remove(children);//todo this ok?
    };





    //visibility

    DMACell.prototype.hide = function(){
        this.object3D.visible = false;
    };

    DMACell.prototype.show = function(mode, callback){
        this.object3D.visible = true;
        this.setMode(mode, callback);
    };

    DMACell.prototype.getMaterialID = function(){
        return this.material.getID();
    };

    DMACell.prototype.setMaterial = function(material){
        this.material = material;
        this._setTHREEMaterial(this.getMaterial(true));
    };

    DMACell.prototype._setTHREEMaterial = function(threeMaterial){
        this.getHighlightableMesh().material = threeMaterial;
    };

    DMACell.prototype.getMaterial = function(returnTHREEObject){
        if (!this.material) {
            console.warn("no material type set for cell");
            return null;
        }
        if (!returnTHREEObject) return this.material;
        if (this.isTransparent) return this.material.getTransparentMaterial();
        return this.material.getThreeMaterial();
    };

    DMACell.prototype.changeMaterial = function(materialID, material){
        if (material === undefined) material = materials.getMaterialForId(materialID);
        this.setMaterial(material);
    };

    DMACell.prototype.setWireframeVisibility = function(visible, mode){
        if (visible && mode === undefined) mode = this.getConditionalMode(appState.get("cellMode"));
        this.object3D.children[1].visible = visible && this.object3D.children[1].name == mode;
    };

    DMACell.prototype.setTransparent = function(transparent){
        this._setTransparent(transparent);
    };

    DMACell.prototype._setTransparent = function(transparent){
        if (transparent == this.isTransparent) return;
        this.isTransparent = transparent;
        this._setTHREEMaterial(this.getMaterial(true));
        this.setWireframeVisibility(!this.isTransparent);
        if (this.parts) {
            _.each(this.parts, function(part){
                part.updateMaterial();
            });
        }
    };

    DMACell.prototype.getConditionalMode = function(mode){
        if (mode == "supercell" && this._isBottomLayer() && this._isTopLayer()) return "cell";//in super cell mode, cell w/o parent are still visible
        return mode;
    };

    DMACell.prototype.setMode = function(mode, callback){

        if (!mode || mode === undefined) mode = appState.get("cellMode");
        var self = this;

        mode = this.getConditionalMode(mode);

        switch(mode) {
            case "supercell":
                setVisiblity();
                break;
            case "cell":
                setVisiblity();
                break;
            case "part":
                if (!this.sparseCells && !this.parts) {
                    this._initParts(function(parts){
                        self.parts = parts;
                        setVisiblity();
                    });
                } else setVisiblity();
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
            self.setWireframeVisibility(!self.isTransparent && visible, mode);

            if (callback) {
                callback();
                return;
            }

            if (!self.superCell) three.conditionalRender();
        }
    };

    DMACell.prototype._isBottomLayer = function(){
        return true;
    };

    DMACell.prototype._isMiddleLayer = function(){
        return false;
    };

    DMACell.prototype._isTopLayer = function(){
        return this.superCell === null || this.superCell === undefined;
    };

    DMACell.prototype.getVisibleGeometry = function(){//for save stl
        var geometry = [];
        if (!this.object3D.visible) return geometry;
        var meshes = _.filter(this.object3D.children, function(child){
            return child.visible && child instanceof THREE.Mesh
        });
        if (meshes.length > 0) {
            var self = this;
            _.each(meshes, function(mesh){
                geometry.push({geo: mesh.geometry, offset:self.getAbsolutePosition(), orientation:mesh.quaternion.clone().multiply(self.getAbsoluteOrientation())});
            });
            return geometry;
        }
        if (!this.sparseCells) return geometry;
        this._loopCells(function(cell){
            if (cell) geometry = geometry.concat(cell.getVisibleGeometry());
        });
        return geometry;
    };

    DMACell.prototype.getCells = function(){
        return [[[this]]];
    };

    DMACell.prototype.getSparseCells = function(){
        return null;
    };







    //subcomponents

    DMACell.prototype._initParts = function(callback){
        if (callback) callback();//override in subclasses
        return [];
    };





    //scale

    DMACell.prototype.aspectRatio = function(){
        return new THREE.Vector3(this.xScale(), this.yScale(), this.zScale());
    };

    DMACell.prototype.xScale = function(){
        return lattice.xScale();
    };

    DMACell.prototype.yScale = function(){
        return lattice.yScale();
    };

    DMACell.prototype.zScale = function(){
        return lattice.zScale();
    };





    //parse
    DMACell.prototype.addToDenseArray = function(cellsArray, min){
        var index = this.getAbsoluteIndex().sub(min);
        if (cellsArray[index.x][index.y][index.z]) {
            console.warn("cell overlap, something bad happened");
            return;
        }
        cellsArray[index.x][index.y][index.z] = this;
    };





    //destroy

    DMACell.prototype.destroy = function(){//todo remove reference from lattice.cells
        this.destroyParts();
        if (this.object3D) {
            if (this.superCell) this.superCell.removeChildren(this.object3D);
            else if (this.index) three.sceneRemove(this.object3D);
            if (!this.sparseCells) lattice.getUItarget().removeHighlightableCell(this.getHighlightableMesh());//remove mesh as highlightable object
            this.object3D.myParent = null;
    //            this.object3D.dispose();
    //            geometry.dispose();
    //            material.dispose();
            this.object3D = null;
        }
        this.superCell = null;
        this.material = null;
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
            materialID: this.getMaterialID()
        };
//        if (this.material.sparseCells) return data;//material definition in material composites
//        if (this.sparseCells) data.cells = this.sparseCells;
        return data;
    };

    return DMACell;
});