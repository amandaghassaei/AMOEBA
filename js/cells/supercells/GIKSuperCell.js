/**
 * Created by aghassaei on 5/26/15.
 */

var allGIKMaterials = {};
var gikMaterialList = AppPList().allMaterialTypes.cube.gik;
function changeGikMaterials(){
    _.each(_.keys(gikMaterialList), function(material){
        if (globals.appState.get("realisticColorScheme")) {
            if (allGIKMaterials[material]) allGIKMaterials[material].color = new THREE.Color(gikMaterialList[material].color);
            else allGIKMaterials[material] = new THREE.MeshLambertMaterial({color:gikMaterialList[material].color});
            if (gikMaterialList[material].opacity){
                allGIKMaterials[material].transparent = true;
                allGIKMaterials[material].opacity = gikMaterialList[material].opacity;
            } else {
                allGIKMaterials[material].transparent = false;
            }
        }
        else {
            if (allGIKMaterials[material]) allGIKMaterials[material].color = new THREE.Color(gikMaterialList[material].altColor);
            else allGIKMaterials[material] = new THREE.MeshLambertMaterial({color:gikMaterialList[material].altColor});
            allGIKMaterials[material].transparent = false;
        }
    });
}

GIKSuperCell = function(index, superCell){
    DMASuperCell.call(this, index, superCell);
};
GIKSuperCell.prototype = Object.create(DMASuperCell.prototype);

GIKSuperCell.prototype._makeSubCellForIndex = function(index){
    return new GIKCell(index, this);
};

GIKSuperCell.prototype._rotateCell = function(object3D){
    if (this.index && this.index.z%2 != 0) object3D.rotateZ(Math.PI/2);
    return object3D;
};

GIKSuperCell.prototype.getMaterial = function(){
    return allGIKMaterials[this.material];
};

GIKSuperCell.prototype._buildMesh = function(){
    var length = globals.lattice.get("superCellRange").x;
    var meshes = [];
    var superCellGeo = new THREE.BoxGeometry(1,1,1.28);
    superCellGeo.applyMatrix(new THREE.Matrix4().makeScale(length, 1, 1));
    superCellGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-length/2+0.5, 0, 0));
    var mesh = new THREE.Mesh(superCellGeo, this.getMaterial());
    mesh.name = "supercell";
    meshes.push(mesh);
    var wireframe = this._buildWireframe(mesh);
    if (!wireframe) return meshes;
    wireframe.name = "supercell";
    meshes.push(wireframe);
    return meshes;
};

GIKSuperCell.prototype._buildWireframe = function(mesh){
    var wireframe = new THREE.BoxHelper(mesh);
    wireframe.material.color.set(0x000000);
    wireframe.matrixWorld = mesh.matrixWorld;
    wireframe.matrixAutoUpdate = true;
    return wireframe;
};