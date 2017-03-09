/**
 * Created by ghassaei on 10/11/16.
 */

define(["three", "threeModel"], function(THREE, three){

    var unitCellGeo = new THREE.BoxGeometry(1,1,1);//new THREE.Geometry()
    var wireframeMaterial = new THREE.LineBasicMaterial({color:0x000000, linewidth:1});

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

    var material = new THREE.MeshLambertMaterial({color:0xff00ff});
    var deleteMaterial = new THREE.MeshLambertMaterial({color:0xff0000});

    function Cell(json){
        this.object3D = this._makeObject3D();
        this.mesh = this.object3D;//visible mesh
        this.index = json.index;

        this.updateForAspectRatio(json.scale);

        three.sceneAddCell(this.object3D);
    }

    Cell.prototype.setPosition = function(position){
        this.object3D.position.set(position.x, position.y, position.z);
    };

    Cell.prototype.setScale = function(scale){
        this.object3D.scale.set(scale.x, scale.y, scale.z);
    };

    Cell.prototype.updateForAspectRatio = function(aspectRatio){
        this.scale = aspectRatio;
        this.setScale(aspectRatio);
        this.originalPosition = this.index.clone().multiply(this.object3D.scale);
        this.setPosition(this.originalPosition);
    };

    Cell.prototype._makeObject3D = function(){
        var object3D = new THREE.Mesh(unitCellGeo, material);
        var wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(unitCellGeo), wireframeMaterial);
        object3D.add(wireframe);
        object3D._myCell = this;
        return object3D;
    };

    Cell.prototype.getHighlighterPosition = function(intersection, aspectRatio){
        var position = intersection.point;
        var normal = intersection.face.normal;
        var normalAxis = "x";
        var self = this;
        _.each(normal, function(val, axis){
            if (Math.abs(val) > 0.9) {
                normalAxis = axis;
                var sign = (val>0 ? 1 : -1);
                position = self.originalPosition.clone();
                position[axis] += aspectRatio[axis]/2*sign;
            }
        });
        return {position:position, normal: normalAxis};
    };

    Cell.prototype.setDeleteMode = function(mode){
        var nextMaterial;
        if (mode) nextMaterial = deleteMaterial;
        else nextMaterial = material;
        if (nextMaterial != this.mesh.material){
            this.mesh.material = nextMaterial;
            three.render();
        }
    };

    Cell.prototype.isInDeleteMode = function(){
        return this.mesh.material == deleteMaterial;
    };

    Cell.prototype.getIndex = function(){
        return this.index.clone();
    };

    Cell.prototype.getNextCellIndex = function(position, normal){
        var diff = position.sub(this.originalPosition);
        var index = this.index.clone();
        if (diff[normal] > 0) index[normal] += 1;
        else index[normal] -= 1;
        return index;
    };

    Cell.prototype.destroy = function(shouldRemove){
        this.object3D._myCell = null;
        if (shouldRemove) three.sceneRemoveCell(this.object3D);
        this.object3D = null;
        this.mesh = null;
        this.index = null;
    };

    return Cell;
});
