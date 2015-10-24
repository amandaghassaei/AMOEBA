/**
 * Created by aghassaei on 6/29/15.
 */

//assume latticeESim has loaded?
define(['cell', 'lattice'], function(DMACell, lattice){

    DMACell.prototype.isConductive = function(){
        return this.getMaterial().getProperties().conductive;
    };

    DMACell.prototype.setConductorGroupNum = function(num, force){
        if (force) this._eSimConductorGroup = num;
        else if (this._eSimConductorGroup>num){
            this._eSimConductorGroup = num;
            this.propagateConductorGroupNum(num);
        }
    };

    DMACell.prototype.getConductorGroupNum = function(){
        return this._eSimConductorGroup;
    };

    DMACell.prototype.propagateConductorGroupNum = function(num){
        if (!this.isConductive()) return;
        if (num === undefined) num = this._eSimConductorGroup;
        lattice.propagateToNeighbors(this.getAbsoluteIndex(), function(neighbor){
            if (neighbor) neighbor.setConductorGroupNum(num);
        });
    };

    DMACell.prototype.conductiveGroupVisible = function(allVisible, groupNum){
        return this.isConductive() && (allVisible || groupNum == this._eSimConductorGroup);
    };

    DMACell.prototype.setStructuralGroupNum = function(num, force){
        if (force) this._eSimStructuralGroup = num;
        else if (this._eSimStructuralGroup>num){
            this._eSimStructuralGroup = num;
            this.propagateStructuralGroupNum(num);
        }
    };

    DMACell.prototype.propagateStructuralGroupNum = function(num){
        if (num === undefined) num = this._eSimStructuralGroup;
        lattice.propagateToNeighbors(this.getAbsoluteIndex(), function(neighbor){
            if (neighbor) neighbor.setStructuralGroupNum(num);
        });
    };

    DMACell.prototype.getStructuralGroupNum = function(){
        return this._eSimStructuralGroup;
    };

    DMACell.prototype.structuralGroupVisible = function(groupNum){
        return groupNum == this._eSimStructuralGroup;
    };


});