/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cubeCell'],
    function(_, THREE, three, lattice, appState, CubeCell){

    function GIKCell(index, superCell){
        CubeCell.call(this, index, superCell);
    }
    GIKCell.prototype = Object.create(CubeCell.prototype);

    GIKCell.prototype._translateCell = function(object3D){
        if (this.index) {
            var offset = this.index.x-this.superCell.getLength();
            object3D.position.set(offset*this.xScale(),0, 0);
        }
        return object3D;
    };

    GIKCell.prototype._getMeshName = function(){
        return null;
    };

    GIKCell.prototype._initParts = function(callback){
        if (!this.superCell) return;
        var self = this;
        var parts  = [];
        var length = this.superCell.getLength()+1;

        if (lattice.get("partType") == "lego") {
            require(['gikPart'], function(GIKPart){
                parts.push(new GIKPart(self.index.x, self));
                callback(parts);
            });
        } else {
            require(['gikPartLowPoly'], function(GIKPartLowPoly){
                parts.push(new GIKPartLowPoly(self.index.x, self));
                callback(parts);
            });
        }
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