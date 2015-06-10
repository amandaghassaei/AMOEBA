/**
 * Created by aghassaei on 5/26/15.
 */



define(['underscore', 'three'], function(_, THREE){

    function DMAPart(index, parent) {
        this.parentCell  = parent;
        this.index = index;
        this.mesh = this._buildMesh();
        this.parentCell.addChildren(this.mesh);//add itself as child of parent cell
    }

    DMAPart.prototype._buildMesh = function(){
        var mesh = this._translatePart(this._rotatePart(new THREE.Mesh(this._getGeometry(), this.getMaterial())));
        mesh.name = "part";
        return mesh;
    };

    DMAPart.prototype._rotatePart = function(mesh){
        return mesh;
    };

    DMAPart.prototype._translatePart = function(mesh){
        return mesh;
    };

    DMAPart.prototype.getMaterial = function(){
        return this.parentCell.getMaterial();
    };

    DMAPart.prototype.destroy = function(){
        if (this.mesh) {
            this.parentCell.removeChildren(this.mesh);
            this.mesh = null;
        }
        this.parentCell = null;
        this.index = null;
    };

    DMAPart.prototype.toJSON = function(){
        return {
        }
    };

    return DMAPart;
});

