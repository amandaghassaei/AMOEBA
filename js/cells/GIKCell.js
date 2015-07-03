/**
 * Created by aghassaei on 5/26/15.
 */


define(['underscore', 'three', 'threeModel', 'lattice', 'appState', 'cubeCell'],
    function(_, THREE, three, lattice, appState, CubeCell){

    function GIKCell(json, superCell){
        CubeCell.call(this, json, superCell);
    }
    GIKCell.prototype = Object.create(CubeCell.prototype);

    GIKCell.prototype._getMeshName = function(){
        return null;//never show the gik cell
    };

    GIKCell.prototype._initParts = function(callback){
        if (!this.superCell) return;
        var self = this;
        var parts  = [];

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

    return GIKCell;
});