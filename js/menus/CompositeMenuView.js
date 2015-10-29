/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'menuParent', 'compositeEditorLattice', 'materialsPlist', 'lattice', 'globals', 'materials', 'text!menus/templates/CompositeMenuView.html'],
    function($, _, MenuParentView, CompositeEditorLattice, materialsPlist, lattice, globals, materials, template){

    var bounds;

    return MenuParentView.extend({

        events: {
            "click #newRandomColor":                                  "_changeRandomColor",
            "click #saveComposite":                                   "_saveCompositeToFile"
        },

        _initialize: function(options){

            var id = options.myObject;
            if (!id) {
                console.warn("no composite editor id");
                return;
            }

            var material;
            if (id) material = materials.getMaterialForId(id);
            if (!material.isComposite()){
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
//            this.listenTo(this.model, "change", this.render);
        },

        _setToCompositeMode: function(json){
            lattice.hideCells();
            if (lattice.inCompositeMode()) {
                console.warn("composite editor already allocated");
                lattice.exitCompositeEditing();
            }
            var compositeLattice = new CompositeEditorLattice();
            compositeLattice.setSparseCells(json.sparseCells);
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
            var self = this;
            require(['fileSaver'], function(fileSaver){
                self._syncLatticeToMaterial();
                fileSaver.saveMaterial(self.material);
            });
        },

        _syncLatticeToMaterial: function(){
            var json = {
                sparseCells: this.compositeEditor.getSparseCells()
            };
            this.material.set(json);
        },

        saveExitMenu: function(){
            this.stopListening();
            if (!this.compositeEditor){
                console.warn("lattice not in composite mode for finish composite call");
                return false;
            }
            this._syncLatticeToMaterial();
            materials.set(this.material.getID(), this.material.toJSON());
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
            return _.extend(this.model.toJSON(), materials.toJSON(), globals, this.material.toJSON(), this.compositeEditor.toJSON(),
                {
                    dimensions: this.compositeEditor.getSize()
                });
        },

        template: _.template(template)
    });
});