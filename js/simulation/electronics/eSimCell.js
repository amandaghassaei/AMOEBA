/**
 * Created by aghassaei on 6/29/15.
 */

//assume latticeESim has loaded?
define(['cell', 'lattice'], function(DMACell, lattice){

    DMACell.prototype.isConductive = function(){
        return this.getMaterial().properties.conductive;
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



});