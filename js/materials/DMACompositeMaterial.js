/**
 * Created by aghassaei on 9/22/15.
 */


define(['material'], function(DMAMaterial){

    var materialNum = 1;

    function getNextMaterialNum(){
        return materialNum++;
    }

    function DMACompositeMaterial(json, id){

        var defaults = {
            elementaryCells: [],
            compositeCells: [],
            sparseCells: [[[null]]],//store as json
            cells: [[[null]]],//store as json
            cellsMin: null,
            cellsMax: null
        };

        json = _.extend(defaults, json);
        DMAMaterial.call(this, json, id);
    }
    DMACompositeMaterial.prototype = Object.create(DMAMaterial.prototype);

    DMACompositeMaterial.prototype.generateMaterialName = function(){
        return "Composite Material " + materialNum++;
    };

    DMACompositeMaterial.prototype.setData = function(data){

        var edited = false;
        if (data.sparseCells){
            edited |= !(_.isEqual(data.sparseCells, this.sparseCells));
            this.sparseCells = data.sparseCells;
            this.cells = this.parseSparseCells(this.sparseCells);
        }
        return edited;
    };

    DMACompositeMaterial.prototype.parseSparseCells = function(sparseCells){
        return [[[null]]];
    };

    DMACompositeMaterial.prototype.getDimensions = function(){
        return this.dimensions.clone();
    };

    DMACompositeMaterial.prototype.isComposite = function(){
        return true;
    };

    DMACompositeMaterial.prototype.isCompositeChild = function(id){
        return this.compositeChildren.indexOf(id)>-1;
    };

    DMACompositeMaterial.prototype.getCells = function(){
        return this.cells;
    };

    DMACompositeMaterial.prototype.getSparseCells = function(){
        return this.sparseCells;
    };

    DMACompositeMaterial.prototype.toJSON = function(){
        var json = DMAMaterial.prototype.toJSON.call(this);
        return _.extend(json, {
            cellsMin: this.cellsMin,
            cellsMax: this.cellsMax,
            compositeChildren: this.compositeChildren,
            elementaryChildren: this.elementaryChildren,
            sparseCells: this.sparseCells
        });
    };

    return DMACompositeMaterial;

});