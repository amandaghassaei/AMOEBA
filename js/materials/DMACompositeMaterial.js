/**
 * Created by aghassaei on 9/22/15.
 */


define(['material'], function(DMAMaterial){

    function DMACompositeMaterial(data){
        DMAMaterial.call(this, data);
    }
    DMACompositeMaterial.prototype = Object.create(DMAMaterial.prototype);

    DMACompositeMaterial.prototype.set = function(data){
        var edited = DMAMaterial.prototype.set.call(this, data);
        if (this.sparseCells) edited |= !(_.isEqual(data.sparseCells, this.sparseCells));
        return edited;
    };

    DMACompositeMaterial.prototype.getDimensions = function(){
        return this.dimensions.clone();
    };

    DMACompositeMaterial.prototype.isComposite = function(){
        return true;
    };

    DMACompositeMaterial.prototype.toJSON = function(){
        return {
                name: this.name,
                color: this.color,
                altColor: this.altColor,
                noDelete: this.noDelete,
                properties: this.properties
            }
    };

});