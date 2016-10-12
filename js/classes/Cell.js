/**
 * Created by ghassaei on 10/11/16.
 */

define(["three", "threeModel"], function(THREE, three){

    var geometry = new THREE.BoxGeometry(1,1,1);
    var material = new THREE.MeshLambertMaterial({color:0xff00ff});

    function Cell(json){
        this.object3D = this._makeObject3D();
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
        var object3D = new THREE.Mesh(geometry, material);
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
        this.index = null;
    };

    return Cell;
});

