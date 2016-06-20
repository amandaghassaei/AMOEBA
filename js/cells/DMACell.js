/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'globals', 'materials'],
    function(_, THREE, three, lattice, appState, globals, materials){

    var wireframeMaterial = new THREE.MeshBasicMaterial({color:0x000000, wireframe:true});

    function DMACell(json){

        if (json.index) this.index = new THREE.Vector3(json.index.x, json.index.y, json.index.z);
        else console.warn("no index given for new cell");

        this.material = materials.getMaterialForId(json.materialID || appState.get("materialType"));//material object
        this.isTransparent = false;

        //object 3d is parent to all 3d elements owned by cell: cell mesh and wireframe, parts, beams, nodes, etc
        var object3D = this._buildObject3D();
        this.object3D = object3D;//save object3D reference
        var cellMeshes = this._buildCellMeshes();//cell mesh and wireframe
        this.addChildren(cellMeshes, object3D);//build cell meshes
        this.addToScene(object3D);
    }


    //make 3d stuff

    DMACell.prototype._buildObject3D = function() {
        var object3D = this._translateCell(this._rotateCell(new THREE.Object3D()));
        object3D.myParent = this;//reference to get mouse raycasting back
        object3D.name = "object3D";
        return object3D;
    };

    DMACell.prototype.addToScene = function(object3D){
        lattice.addHighlightableCell(this.getHighlightableMesh());//add mesh as highlightable object
        three.sceneAdd(object3D);//add object3d as child of scene
    };

    DMACell.prototype.getHighlightableMesh = function(){
        return this.object3D.children[0];
    };

    DMACell.prototype.getVisibleMesh = function(){
        var children = this.object3D.children;
        if (children[1].name == "part") return children[1];
        return children[0];
    };

    DMACell.prototype._rotateCell = function(object3D){
        return object3D;//by default, no mesh transformations
    };

    DMACell.prototype._translateCell = function(object3D){
        var position = lattice.getPositionForIndex(this.index);
        object3D.position.set(position.x, position.y, position.z);
        return object3D;
    };

    DMACell.prototype._buildCellMeshes = function(){
        var geometry = this._getGeometry();

        var meshes = [];
        var mesh = new THREE.Mesh(geometry, this.getMaterial(true));
        mesh.name = this._getMeshName();

        meshes.push(mesh);

        var wireframeMesh = mesh;
        var partGeo = this._getPartGeo();
        if (partGeo){
            var partMesh = new THREE.Mesh(partGeo, this.getMaterial(true));
            partMesh.name = "part";
            meshes.push(partMesh);
            wireframeMesh = partMesh;
            mesh.visible = false;
        }

        var wireframe = this._buildWireframe(wireframeMesh, geometry);
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
        return this.index.clone();
    };

    DMACell.prototype.getDimensions = function(){
        return new THREE.Vector3(1,1,1);
    };

    DMACell.prototype.getLatticeIndex = function(){//relative index in lattice
        return this.getIndex().sub(lattice.get("cellsMin"));
    };

    DMACell.prototype.getPosition = function(){
        return this.object3D.position.clone();
    };

    DMACell.prototype.rotateX = function(){
        this.object3D.rotateX(Math.PI/2);
    };

    DMACell.prototype.rotateY = function(){
        this.object3D.rotateY(Math.PI/2);
    };

    DMACell.prototype.rotateZ = function(){
        this.object3D.rotateZ(Math.PI/2);
    };

    DMACell.prototype.getRotation = function(){
        return this.object3D.rotation;
    };

    DMACell.prototype.getOrientation = function(){
        return this.object3D.quaternion.clone();
    };

    DMACell.prototype.applyRotation = function(vector){
        vector.applyQuaternion(this.getOrientation());
        return vector;
    };







    //highlighting

    DMACell.prototype.calcHighlighterParams = function(face, point){//this works for cells where addition happens orthogonal to all faces
        var direction = this.applyRotation(face.normal.clone());
        var position = this.getPosition();
        position.add(direction.clone().multiply(this.aspectRatio().divideScalar(2)));
        return {direction:direction, position:position};
    };

    DMACell.prototype.setDeleteMode = function(state){
        var threeMaterial;
        if (!state && !this.material) return;//cell may be deleted by now todo need this?
        if (state) threeMaterial = materials.getDeleteMaterial();
        else  threeMaterial = this.getMaterial(true);
        if (!threeMaterial) return;//no material object found

        this._setTHREEMaterial(threeMaterial);
    };

    DMACell.prototype.getParent = function(){//todo need this?
        return this;
    };







    //children of object3D

    DMACell.prototype.addChildren = function(children, object3D){//accepts an array or a single mesh
        this._addRemoveChildren(true, children, object3D);
    };

    DMACell.prototype.removeChildren = function(children, object3D){//accepts an array or a single mesh
        this._addRemoveChildren(false, children, object3D);
    };

    DMACell.prototype._addRemoveChildren = function(shouldAdd, children, object3D){//accepts an array or a single mesh
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

    DMACell.prototype.show = function(){
        this.object3D.visible = true;
    };

    DMACell.prototype.getMaterialID = function(){
        return this.material.getID();
    };

    DMACell.prototype.setMaterial = function(material){
        this.material = material;
        this._setTHREEMaterial(this.getMaterial(true));
    };

    DMACell.prototype._setTHREEMaterial = function(threeMaterial){
        this.getVisibleMesh().material = threeMaterial;
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

    DMACell.prototype.changeMaterial = function(materialID, material){//todo should use this?
        if (material === undefined) material = materials.getMaterialForId(materialID);
        this.setMaterial(material);
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

    DMACell.prototype.setWireframeVisibility = function(visible){
        this.getWireFrameMesh().visible = visible;
    };

    DMACell.prototype.getWireFrameMesh = function(){
        var children = this.object3D.children;
        if (children[1].name == "part") return children[2];
        return children[1];
    };





    DMACell.prototype.getVisibleGeometry = function(){//for save stl
        var geometry = [];
        if (this.isTransparent) return geometry;
        if (!this.object3D.visible) return geometry;
        var mesh = this.getVisibleMesh();
        if (mesh.visible) geometry.push({geo: mesh.geometry, offset:this.getPosition(), orientation:mesh.quaternion.clone().multiply(this.getOrientation())});
        return geometry;
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


    //destroy

    DMACell.prototype.destroy = function(){//todo remove reference from lattice.cells
        if (this.object3D) {
            var object3D = this.object3D;
            three.sceneRemove(object3D);
            lattice.removeHighlightableCell(this.getHighlightableMesh());//remove mesh as highlightable object
            object3D.myParent = null;
            _.each(this.object3D.children, function(child, index){
                object3D.children[index] = null;
            });
    //            this.object3D.dispose();
    //            geometry.dispose();
    //            material.dispose();
            this.object3D = null;
        }
        this.material = null;
        this.index = null;
    };

    DMACell.prototype.toJSON = function(){
        var data = {
            materialID: this.getMaterialID()
        };
        return data;
    };

    return DMACell;
});