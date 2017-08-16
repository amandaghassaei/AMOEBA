/**
 * Created by amandaghassaei on 3/9/17.
 */

//all stls
//all textures
//all materials
define(["underscore", "materialPlist", "Material"], function(_, materialPlist, Material){

    var allTextures = {};
    var allMaterials = {};
    var customMeshTypes = {};

        var torsion1dof = new THREE.Geometry();
        //torsion
    torsion1dof.vertices = [
        new THREE.Vector3(0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, 0.5, -0.5),
        new THREE.Vector3(0.5, -0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(-0.5, 0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 0.5),
        new THREE.Vector3(-0.5, -0.5, -0.5)

    ];
    torsion1dof.faces  = [
        new THREE.Face3(5, 0, 2),
        new THREE.Face3(5, 2, 1),
        new THREE.Face3(4, 3, 6),
        new THREE.Face3(3, 4, 7),
        new THREE.Face3(1, 2, 6),
        new THREE.Face3(1, 6, 3),
        new THREE.Face3(0, 7, 4),
        new THREE.Face3(0, 5, 7),
        new THREE.Face3(2, 0, 4),
        new THREE.Face3(2, 4, 6),
        new THREE.Face3(1, 3, 5),
        new THREE.Face3(5, 3, 7)
    ];
    customMeshTypes["torsion1dof"] = torsion1dof;

    var bending1dof = new THREE.Geometry();

        //1dof hinge vertices and faces
    bending1dof.vertices = [
        new THREE.Vector3(0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, 0.5, -0.5),
        new THREE.Vector3(0.5, -0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(-0.5, 0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 0.5),
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0, 0, -0.5)
    ];
    bending1dof.faces  = [
        new THREE.Face3(1, 0, 2),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 5, 7),
        new THREE.Face3(3, 2, 8),
        new THREE.Face3(3, 8, 9),
        new THREE.Face3(9, 6, 7),
        new THREE.Face3(9, 8, 6),
        new THREE.Face3(0, 1, 8),
        new THREE.Face3(1, 9, 8),
        new THREE.Face3(4, 9, 5),
        new THREE.Face3(8, 9, 4),
        new THREE.Face3(2, 0, 8),
        new THREE.Face3(8, 4, 6),
        new THREE.Face3(1, 3, 9),
        new THREE.Face3(5, 9, 7)
    ];
    customMeshTypes["bending1dof"] = bending1dof;

    var bending2dof = new THREE.Geometry();

        //2dof hinge vertices and faces
    bending2dof.vertices = [
        new THREE.Vector3(0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, 0.5, -0.5),
        new THREE.Vector3(0.5, -0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(-0.5, 0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 0.5),
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(0, 0, 0)
    ];
    bending2dof.faces  = [
        new THREE.Face3(1, 0, 2),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 5, 7),
        new THREE.Face3(3, 2, 8),
        new THREE.Face3(8, 6, 7),
        new THREE.Face3(8, 8, 6),
        new THREE.Face3(0, 1, 8),
        new THREE.Face3(4, 8, 5),
        new THREE.Face3(8, 8, 4),
        new THREE.Face3(2, 0, 8),
        new THREE.Face3(8, 4, 6),
        new THREE.Face3(1, 3, 8),
        new THREE.Face3(5, 8, 7)
    ];
    customMeshTypes["bending2dof"] = bending2dof;

    _.each(_.keys(customMeshTypes), function(key){
        var mesh = customMeshTypes[key];
        mesh.computeFaceNormals();
        assignUVs(mesh);
    });

    function assignUVs( geometry ){
        geometry.computeBoundingBox();
        var max     = geometry.boundingBox.max;
        var min     = geometry.boundingBox.min;
        var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
        var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);
        geometry.faceVertexUvs[0] = [];
        var faces = geometry.faces;
        for (var i = 0; i < geometry.faces.length ; i++) {
          var v1 = geometry.vertices[faces[i].a];
          var v2 = geometry.vertices[faces[i].b];
          var v3 = geometry.vertices[faces[i].c];
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
            new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
            new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
          ]);
        }
        geometry.uvsNeedUpdate = true;
    }

    //init default materials
    _.each(materialPlist.allMaterials, function(materialJSON, id){
        allMaterials[id] = new Material(materialJSON, id, customMeshTypes);
    });

    function getMaterialForId(id){
        return allMaterials[id];
    }

    return {
        getMaterialForId: getMaterialForId
    }
});