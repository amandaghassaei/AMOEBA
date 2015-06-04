/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cubeCell'],
    function(_, THREE, three, lattice, appState, CubeCell){

    var unitGeo = new THREE.BoxGeometry(1,1,1.28);

    function GIKCell(index, superCell){
        CubeCell.call(this, index, superCell);
    }
    GIKCell.prototype = Object.create(CubeCell.prototype);


    GIKCell.prototype._getGeometry = function(){
        return unitGeo;
    };

    GIKCell.prototype._translateCell = function(object3D){
        if (this.index) {
            var offset = this.index.x-this.superCell.getLength();
            object3D.position.set(offset*this.xScale(),0, 0);
        }
        return object3D;
    };

    GIKCell.prototype._rotateCell = function(object3D){
        var length = this.superCell.getLength();
        if (this.index.x == length) object3D.rotateZ(Math.PI);
        return object3D;
    };

    GIKCell.prototype.getMaterial = function(){
        return this.superCell.getMaterial();
    };

    GIKCell.prototype._initParts = function(){
        if (!this.superCell) return null;
        var parts  = [];
        var isEnd = false;
//        var isEnd = this.superCellIndex == 0 || this.superCellIndex == this.superCell.getLength();
        if (globals.lattice.get("partType") == "lego") {
            if (isEnd) parts.push(new DMAGIKEndPart(0, this));
            else parts.push(new DMAGIKPart(0, this));
        }
        else {
            if (isEnd) parts.push(new DMAGIKEndPartLowPoly(0, this));
            else parts.push(new DMAGIKPartLowPoly(0, this));
        }
        return parts;
    };

    GIKCell.prototype.calcHighlighterPosition = function(face){
        var direction = face.normal.clone().applyEuler(this.object3D.rotation).applyEuler(this.object3D.parent.rotation);
        var position = this.getPosition();
        var self = this;
        _.each(_.keys(position), function(key){
            position[key] += direction[key]*self.axisScale(key)/2;
        });
        return {index: _.clone(this.index), direction:direction, position:position};
    };

    return GIKCell;
});