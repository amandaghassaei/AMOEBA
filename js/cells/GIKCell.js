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

        if (lattice.get("partType") == "willLego") {
            require(['gikPart'], function(PartSubclass){
                parts.push(new PartSubclass(self.index.x, self));
                callback(parts);
            });
        } else if (lattice.get("partType") == "willLegoLowPoly") {
            require(['gikPartLowPoly'], function(PartSubclass){
                parts.push(new PartSubclass(self.index.x, self));
                callback(parts);
            });
        } else if (lattice.get("partType") == "dnaLego") {
            require(['legoPart'], function(PartSubclass){
                parts.push(new PartSubclass(self.index.x, self));
                callback(parts);
            });
        } else if (lattice.get("partType") == "lego") {
            require(['legoPart'], function(PartSubclass){
                parts.push(new PartSubclass(self.index.x, self));
                callback(parts);
            });
        } else if (lattice.get("partType") == "dnaStraight") {
            require(['gikPartLowPoly'], function(PartSubclass){
                parts.push(new PartSubclass(self.index.x, self));
                callback(parts);
            });
        }
    };

    //todo move this somewhere else
    GIKCell.prototype.propagateConductorGroupNum = function(num){
        if (!this.isConductive()) return;
        if (num === undefined) num = this._eSimConductorGroup;
        var self = this;
        this.superCell._loopCells(function(cell){
            if (cell == self) return;
            if (cell) cell.setConductorGroupNum(num);
        });
        CubeCell.prototype.propagateConductorGroupNum.call(this, num);
    };

    return GIKCell;
});