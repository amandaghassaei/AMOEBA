/**
 * Created by aghassaei on 5/26/15.
 */


define(['three', 'cell'],
    function(THREE, DMACell){

    //var unitCellGeo = new THREE.BoxGeometry(1,1,1);

    var unitCellGeo = new THREE.BoxGeometry(1,1,1);//new THREE.Geometry();
    //
    //    //box vertices
    //unitCellGeo.vertices = [
    //    new THREE.Vector3(0.5, 0.5, 0.5),
    //    new THREE.Vector3(0.5, 0.5, -0.5),
    //    new THREE.Vector3(0.5, -0.5, 0.5),
    //    new THREE.Vector3(0.5, -0.5, -0.5),
    //    new THREE.Vector3(-0.5, 0.5, 0.5),
    //    new THREE.Vector3(-0.5, 0.5, -0.5),
    //    new THREE.Vector3(-0.5, -0.5, 0.5),
    //    new THREE.Vector3(-0.5, -0.5, -0.5)
    //
    //];
    //    //box
    //unitCellGeo.faces  = [
    //    new THREE.Face3(1, 0, 2),
    //    new THREE.Face3(1, 2, 3),
    //    new THREE.Face3(4, 5, 6),
    //    new THREE.Face3(6, 5, 7),
    //    new THREE.Face3(3, 2, 6),
    //    new THREE.Face3(3, 6, 7),
    //    new THREE.Face3(0, 1, 4),
    //    new THREE.Face3(4, 1, 5),
    //    new THREE.Face3(2, 0, 4),
    //    new THREE.Face3(2, 4, 6),
    //    new THREE.Face3(1, 3, 5),
    //    new THREE.Face3(5, 3, 7)
    //];
    //
    //unitCellGeo.computeFaceNormals();

    var zone0 = [new THREE.Vector2(0, .666), new THREE.Vector2(.5, .666), new THREE.Vector2(.5, 1), new THREE.Vector2(0, 1)];
    var zone1 = [new THREE.Vector2(.5, .666), new THREE.Vector2(1, .666), new THREE.Vector2(1, 1), new THREE.Vector2(.5, 1)];
    var zone2 = [new THREE.Vector2(0, .333), new THREE.Vector2(.5, .333), new THREE.Vector2(.5, .666), new THREE.Vector2(0, .666)];
    var zone3 = [new THREE.Vector2(.5, .333), new THREE.Vector2(1, .333), new THREE.Vector2(1, .666), new THREE.Vector2(.5, .666)];
    var zone4 = [new THREE.Vector2(0, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(.5, .333), new THREE.Vector2(0, .333)];
    var zone5 = [new THREE.Vector2(.5, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, .333), new THREE.Vector2(.5, .333)];

    unitCellGeo.faceVertexUvs[0] = [];
    unitCellGeo.faceVertexUvs[0][0] = [ zone0[0], zone0[1], zone0[3] ];
    unitCellGeo.faceVertexUvs[0][1] = [ zone0[1], zone0[2], zone0[3] ];
      
    unitCellGeo.faceVertexUvs[0][2] = [ zone1[0], zone1[1], zone1[3] ];
    unitCellGeo.faceVertexUvs[0][3] = [ zone1[1], zone1[2], zone1[3] ];
      
    unitCellGeo.faceVertexUvs[0][4] = [ zone2[0], zone2[1], zone2[3] ];
    unitCellGeo.faceVertexUvs[0][5] = [ zone2[1], zone2[2], zone2[3] ];
      
    unitCellGeo.faceVertexUvs[0][6] = [ zone3[0], zone3[1], zone3[3] ];
    unitCellGeo.faceVertexUvs[0][7] = [ zone3[1], zone3[2], zone3[3] ];
      
    unitCellGeo.faceVertexUvs[0][8] = [ zone4[0], zone4[1], zone4[3] ];
    unitCellGeo.faceVertexUvs[0][9] = [ zone4[1], zone4[2], zone4[3] ];
      
    unitCellGeo.faceVertexUvs[0][10] = [ zone5[0], zone5[1], zone5[3] ];
    unitCellGeo.faceVertexUvs[0][11] = [ zone5[1], zone5[2], zone5[3] ];
    unitCellGeo.uvsNeedUpdate = true;

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