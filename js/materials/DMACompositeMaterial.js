/**
 * Created by aghassaei on 9/22/15.
 */


define(['three', 'material'], function(THREE, DMAMaterial){

    var materialNum = 1;//outward facing name

    function DMACompositeMaterial(json, id){

        var defaults = {
            elementaryCells: [],
            compositeCells: [],
            sparseCells: [[[null]]],//store as json
            cells: [[[null]]],//store as json
            cellsMin: null,
            cellsMax: null,
            dimensions: new THREE.Vector3(0,0,0),
            numCells: 0,
            origin: new THREE.Vector3(0,0,0)
        };

        json = _.extend(defaults, json);
        DMAMaterial.call(this, json, id);
    }
    DMACompositeMaterial.prototype = Object.create(DMAMaterial.prototype);

    DMACompositeMaterial.prototype.generateMaterialName = function(){
        return "Composite Material " + materialNum++;
    };

    DMACompositeMaterial.prototype.setMetaData = function(data){
        var changed = DMAMaterial.prototype.setMetaData.call(this, data);

        var self = this;
        _.each(["origin", "cellsMin", "cellsMax", "dimensions"], function(key){
            if (data[key] && data[key] != self[key]) {
                self[key] = new THREE.Vector3(data[key].x, data[key].y, data[key].z);
                changed = true;
            }
        });
        return changed;
    };

    DMACompositeMaterial.prototype.setData = function(data){

        var edited = false;
        if (data.sparseCells){
            edited |= !(_.isEqual(data.sparseCells, this.sparseCells));//todo must be comparing json
            this.sparseCells = data.sparseCells;
            var numCells = 0;
            this.loopCells(function(){
                numCells++;
            });
            this.numCells = numCells;
        }

        if (edited){
            var self = this;
            require(['materials'], function(materials){

                var changed = self.recalcChildren(materials);

                var parentComposites = self.getParentComposites(materials);
                if (changed){
                    _.each(parentComposites, function(parentID){
                        var parent = materials.getMaterialForId(parentID);
                        parent.recalcChildren(materials);
                    });
                }
            });
        }
        return edited;
    };

    DMACompositeMaterial.prototype.getFirstGenChildMaterials = function(materials){
        var compositeChildrenFirstGen = [];
        var elementaryChildrenFirstGen = [];
        this.loopCells(function(cell, x, y, z){
            var materialID = cell.materialID;//cells json
            var material = materials.getMaterialForId(materialID);
            if (material.isComposite()) compositeChildrenFirstGen.push(materialID);
            else elementaryChildrenFirstGen.push(materialID);
        });
        return {compositeCells:_.uniq(compositeChildrenFirstGen),
            elementaryCells:_.uniq(elementaryChildrenFirstGen)};
    };

    DMACompositeMaterial.prototype.recalcChildren = function(materials){
        var compositeChildren = [];
        var elementaryChildren = [];

        var firstGen = this.getFirstGenChildMaterials(materials);
        elementaryChildren = _.clone(firstGen.elementaryCells);
        compositeChildren = _.clone(firstGen.compositeCells);

        _.each(firstGen.compositeCells, function(compositeID){
            var material = materials.getMaterialForId(compositeID);
            compositeChildren.push.apply(compositeChildren, material.getCompositeChildren());
            elementaryChildren.push.apply(elementaryChildren, material.getElementaryChildren());
        });

        compositeChildren = _.uniq(compositeChildren);
        elementaryChildren = _.uniq(elementaryChildren);

        var changed = !_.isEqual(this.getElementaryChildren(), elementaryChildren);
        if (changed) this.properties = this.getPropertiesFromElements(elementaryChildren, materials);

        changed |= !_.isEqual(this.getCompositeChildren(), compositeChildren);

        this.compositeChildren = compositeChildren;
        this.elementaryChildren = elementaryChildren;

        return changed;
    };

    DMACompositeMaterial.prototype.getPropertiesFromElements = function(elementaryChildren, materials){
        var properties = {};
        _.each(elementaryChildren, function(childID){
            if (materials.getMaterialForId(childID).getProperties().conductive) properties.conductive = true;
        });
        return properties;
    };

    DMACompositeMaterial.prototype.getCompositeChildren = function(){
        return this.compositeChildren;
    };

    DMACompositeMaterial.prototype.getElementaryChildren = function(){
        return this.elementaryChildren;
    };

    DMACompositeMaterial.prototype.getDimensions = function(){
        return this.dimensions.clone();
    };

    DMACompositeMaterial.prototype.isComposite = function(){
        return true;
    };

    DMACompositeMaterial.prototype.isCompositeChildOf = function(id){
        return this.compositeChildren.indexOf(id)>-1;
    };

    DMACompositeMaterial.prototype.getSparseCells = function(){
        return this.sparseCells;//json description
    };

    DMACompositeMaterial.prototype.getNumCells = function(){
        return this.numCells;
    };

    DMACompositeMaterial.prototype.loopCells = function(callback){
        var cells = this.sparseCells;
        for (var x=0;x<cells.length;x++){
            for (var y=0;y<cells[0].length;y++){
                for (var z=0;z<cells[0][0].length;z++){
                    if (cells[x][y][z]) callback(cells[x][y][z], x, y, z);
                }
            }
        }
    };

    DMACompositeMaterial.prototype.toJSON = function(){
        var json = DMAMaterial.prototype.toJSON.call(this);
        return _.extend(json, {
            compositeChildren: this.compositeChildren,
            elementaryChildren: this.elementaryChildren,
            sparseCells: this.sparseCells,
            dimensions: this.dimensions,
            isComposite: true,
            numCells: this.numCells,
            origin: this.origin
        });
    };

    return DMACompositeMaterial;

});