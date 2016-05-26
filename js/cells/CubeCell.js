/**
 * Created by aghassaei on 5/26/15.
 */


define(['three', 'cell'],
    function(THREE, DMACell){

    //var unitCellGeo = new THREE.BoxGeometry(1,1,1);

    var unitCellGeo = new THREE.Geometry();

        //box vertices
    unitCellGeo.vertices = [
        new THREE.Vector3(0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, 0.5, -0.5),
        new THREE.Vector3(0.5, -0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(-0.5, 0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 0.5),
        new THREE.Vector3(-0.5, -0.5, -0.5)

    ];
        //box
    unitCellGeo.faces  = [
        new THREE.Face3(1, 0, 2),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 5, 7),
        new THREE.Face3(3, 2, 6),
        new THREE.Face3(3, 6, 7),
        new THREE.Face3(0, 1, 4),
        new THREE.Face3(4, 1, 5),
        new THREE.Face3(2, 0, 4),
        new THREE.Face3(2, 4, 6),
        new THREE.Face3(1, 3, 5),
        new THREE.Face3(5, 3, 7)
    ];

    unitCellGeo.computeFaceNormals();
        assignUVs(unitCellGeo);

    function assignUVs( geometry ){
        geometry.computeBoundingBox();
        var max     = geometry.boundingBox.max;
        var min     = geometry.boundingBox.min;
        var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
        var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);
        geometry.faceVertexUvs[0] = [];
        var faces = geometry.faces;
        for (i = 0; i < geometry.faces.length ; i++) {
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

    function CubeCell(json, superCell){
        DMACell.call(this, json, superCell);
    }
    CubeCell.prototype = Object.create(DMACell.prototype);

    CubeCell.prototype._getGeometry = function(){
        return unitCellGeo;
    };

    CubeCell.prototype._getPartGeo = function(){
        var mesh = this.getMaterial().getMesh();
        if (mesh) return mesh;
        return null;
    };

    CubeCell.prototype._buildWireframe = function(mesh){//abstract mesh representation of cell
        var wireframe = new THREE.EdgesHelper(mesh);
        wireframe.material.color.set(0x000000);
        wireframe.matrixWorld = mesh.matrixWorld;
        wireframe.matrixAutoUpdate = true;
        return wireframe;
    };

    return CubeCell;
});