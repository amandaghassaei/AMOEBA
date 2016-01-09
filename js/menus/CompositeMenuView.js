/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'three', 'menuParent', 'compositeEditorLattice', 'materialsPlist', 'lattice', 'globals', 'materials', 'text!menus/templates/CompositeMenuView.html'],
    function($, _, THREE, MenuParentView, CompositeEditorLattice, materialsPlist, lattice, globals, materials, template){

    return MenuParentView.extend({

        events: {
            "click #newRandomColor":                                  "_changeRandomColor",
            "click #saveComposite":                                   "_saveCompositeToFile"
        },

        _initialize: function(options){

            var id = options.myObject;

            var material;
            if (id) material = materials.getMaterialForId(id);
            if (material && !material.isComposite()){
                console.warn("material " + id + " is not a composite");

            }

            var json = {};
            if (material) json = material.toJSON();
            else if (id == "_fromLattice"){
                json.sparseCells = lattice.getSparseCellsJSON();
                lattice.clearCells();
            }
            material = materials.newCompositeMaterial(json, {_noAdd: true});

            this.material = material;
            this.compositeEditor = this._setToCompositeMode(material.toJSON());

            this.listenTo(this.compositeEditor, "change:numCells", this.render);
            this.listenTo(this.model, "change", this.render);
        },

        _setToCompositeMode: function(json){
            lattice.hideCells();
            if (lattice.inCompositeMode()) {
                console.warn("composite editor already allocated");
                lattice.exitCompositeEditing();
            }
            var compositeLattice = new CompositeEditorLattice();
            compositeLattice.setSparseCells(json.sparseCells, lattice.getOffset());
            lattice.setToCompositeMode(compositeLattice);
            return compositeLattice;
        },



        _changeRandomColor: function(e){
            e.preventDefault();
            this.material.changeRandomColor();
            this.render();
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("compositeEditor")) return this.compositeEditor;
            return null;
        },

        updateHex: function(hex, $target){
            //update hex without rendering
            $target.css("border-color", hex);
        },

        _saveCompositeToFile: function(e){
            e.preventDefault();

            this.material.set(this._buildMaterialJSON());//todo this should be a callback
            var self = this;
            require(['fileSaver'], function(fileSaver){
                fileSaver.saveMaterial(self.material);
            });
        },

        _buildMaterialJSON: function(){
            var json = {
                sparseCells: this.compositeEditor.getSparseCellsJSON(),
                dimensions: this.compositeEditor.getSize()

            };
            if (this.compositeEditor.getNumCells() > 0){
                _.extend(json, {
                    origin: new THREE.Vector3(0,0,0),
                    cellsMin: new THREE.Vector3(0,0,0),
                    cellsMax: this.compositeEditor.get("cellsMax").clone().sub(this.compositeEditor.get("cellsMin"))
                });
            } else {
                console.warn("composite material has no cells");
            }
            return json;
        },

        saveExitMenu: function(){
            this.stopListening();
            if (!this.compositeEditor){
                console.warn("lattice not in composite mode for finish composite call");
                return false;
            }
            if (this.compositeEditor.getNumCells() > 0){
                materials.setCompositeMaterial(this.material.getID(), _.extend(this.material.toJSON(), this._buildMaterialJSON()));
            } else {
                console.warn("no cells in composite definition, save cancelled");
            }
            return true;
        },

        deleteExitMenu: function(){
            if (!this.compositeEditor){
                console.warn("lattice not in composite mode for delete composite call");
                return true;
            }
            return materials.deleteMaterialById(this.material.getID());
        },

        _makeTemplateJSON: function(){
            var compositeParents = this.material.getParentComposites(materials);
            compositeParents.push(this.material.getID());
            return _.extend(this.model.toJSON(), materials.toJSON(), materialsPlist, globals, this.material.toJSON(), this.compositeEditor.toJSON(),
                {
                    dimensions: this.compositeEditor.getSize(),
                    validCompositeMaterials: _.difference(materials.getAllCompositeKeys(), compositeParents)
                });
        },

        template: _.template(template)
    });
});